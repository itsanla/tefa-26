import type { MetadataRoute } from "next";
import { readdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://smk2batusangkar.tech";

const appDir = path.join(process.cwd(), "src", "app");

function normalizeRouteSegments(segments: string[]): string[] {
  return segments.filter((segment) => {
    if (!segment) return false;

    // Exclude route groups, parallel routes, and intercepting segments from URL path.
    if (/^\(.*\)$/.test(segment)) return false;
    if (segment.startsWith("@")) return false;
    if (segment.startsWith("(.)") || segment.startsWith("(..") || segment.startsWith("(...")) return false;

    return true;
  });
}

async function collectPageRoutes(dir: string, parentSegments: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const routes: string[] = [];

  const hasPage = entries.some((entry) => entry.isFile() && entry.name === "page.tsx");
  if (hasPage) {
    const normalizedSegments = normalizeRouteSegments(parentSegments);
    const routePath = normalizedSegments.length ? `/${normalizedSegments.join("/")}` : "/";
    routes.push(routePath);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const childDir = path.join(dir, entry.name);
    routes.push(...(await collectPageRoutes(childDir, [...parentSegments, entry.name])));
  }

  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const discoveredRoutes = await collectPageRoutes(appDir);

  // Include /dashboard, but exclude all child routes under /dashboard/*.
  const filteredRoutes = discoveredRoutes.filter(
    (routePath) => routePath === "/dashboard" || !routePath.startsWith("/dashboard/")
  );

  if (!filteredRoutes.includes("/dashboard")) {
    filteredRoutes.push("/dashboard");
  }

  const uniqueRoutes = Array.from(new Set(filteredRoutes)).sort((a, b) => a.localeCompare(b));
  const now = new Date();

  return uniqueRoutes.map((routePath) => ({
    url: routePath === "/" ? baseUrl : `${baseUrl}${routePath}`,
    lastModified: now,
    changeFrequency: routePath === "/" ? "weekly" : "monthly",
    priority: routePath === "/" ? 1.0 : routePath === "/dashboard" ? 0.8 : 0.7,
  }));
}
