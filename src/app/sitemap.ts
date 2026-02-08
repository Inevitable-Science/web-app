import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.inevitable.science/",
      lastModified: "2026-02-07",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://www.inevitable.science/articles",
      lastModified: "2026-02-07",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.inevitable.science/team",
      lastModified: "2026-02-07",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://www.inevitable.science/vision",
      lastModified: "2026-02-07",
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
