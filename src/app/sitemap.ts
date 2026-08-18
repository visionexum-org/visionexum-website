import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

// Single-page site — sections are in-page anchors, not separate routes, so
// there's only one URL to list. Add entries here if/when real subpages exist.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
