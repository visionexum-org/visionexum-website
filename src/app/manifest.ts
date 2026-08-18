import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "Ajudamos PMEs angolanas a transformar percepção numa vantagem estratégica mensurável.",
    start_url: "/",
    display: "standalone",
    background_color: "#001F35",
    theme_color: "#001F35",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
