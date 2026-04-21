"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = readCookie("token");
    const role = readCookie("role");
    const isLoggedIn = !!token;

    const isProtected =
      pathname.startsWith("/dashboard") || pathname.startsWith("/siswa");

    if (!isLoggedIn && isProtected) {
      router.replace("/login");
      return;
    }

    if (isLoggedIn && pathname === "/login") {
      if (role === "siswa") router.replace("/siswa");
      else if (role === "guru") router.replace("/dashboard/produksi/penjualan");
      else if (role === "kepsek") router.replace("/dashboard/kepsek");
      else router.replace("/dashboard/kepsek");
      return;
    }

    if (isLoggedIn) {
      if (role === "siswa" && !pathname.startsWith("/siswa")) {
        router.replace("/siswa");
        return;
      }

      if (
        role === "guru" &&
        (pathname.startsWith("/dashboard/user") ||
          pathname.startsWith("/dashboard/kepsek"))
      ) {
        router.replace("/dashboard/produksi/penjualan");
        return;
      }

      if (role === "kepsek" && pathname.startsWith("/dashboard/user")) {
        router.replace("/dashboard/kepsek");
        return;
      }
    }

    setReady(true);
  }, [pathname, router]);

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/siswa") ||
    pathname === "/login";

  if (isProtectedRoute && !ready) return null;

  return <>{children}</>;
}
