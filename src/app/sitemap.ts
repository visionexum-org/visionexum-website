import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

// The marketing content is one page — its sections are in-page anchors, not
// routes. Only genuine routes belong here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacidade`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
