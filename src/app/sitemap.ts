import type { MetadataRoute } from "next";
import { CONTENT_LAST_MODIFIED, SITE_URL } from "@/lib/site-config";

// The marketing content is one page — its sections are in-page anchors, not
// routes. Only genuine routes belong here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacidade`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
