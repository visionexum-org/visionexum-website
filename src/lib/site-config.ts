// Single source of truth for the site's public identity — metadata, JSON-LD,
// sitemap and robots all read from here instead of hardcoding the domain.
// NEXT_PUBLIC_SITE_URL must be set to the real production domain before
// launch (see .env.example); this fallback only covers local dev.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const SITE_NAME = "Visio Nexum";

export const SITE_TITLE = "Visio Nexum — Construímos a fundação da sua percepção";

export const SITE_DESCRIPTION =
  "Ajudamos PMEs angolanas a transformar percepção numa vantagem estratégica mensurável — através do Visio Method™.";
