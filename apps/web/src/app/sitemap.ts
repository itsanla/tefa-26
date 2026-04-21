import type { MetadataRoute } from "next";

const baseUrl = "https://smk2batusangkar.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Homepage - Highest Priority
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    
    // Public Pages - High Priority
    {
      url: `${baseUrl}/komoditas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    
    // Authentication Pages - Medium Priority
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    
    // Dashboard Pages - Lower Priority (requires auth)
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dashboard/user`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dashboard/kepsek`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dashboard/produksi`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dashboard/gudang`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/siswa`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
  ];
}
