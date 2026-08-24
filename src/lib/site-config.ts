// Single source of truth for the site's public identity. Metadata, structured
// data, sitemap and robots all read from here rather than hardcoding values.
// NEXT_PUBLIC_SITE_URL must match the canonical host served in production,
// including the www prefix where one is used; a mismatch causes the sitemap
// and canonical tags to reference URLs that redirect.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const SITE_NAME = "Visio Nexum";

export const SITE_TITLE =
  "Visio Nexum — Arquitectura de percepção para PMEs em Angola";

export const SITE_DESCRIPTION =
  "Consultoria de percepção de marca em Angola. Medimos a percepção da sua empresa com o Visio Score™ e arquitectamos a fundação estratégica que a torna mensurável. Diagnóstico em 4 semanas.";

// Locale is declared as pt-AO rather than pt: the audience, the market and the
// regulatory context are Angolan, and search engines use the regional subtag
// when ranking local results.
export const SITE_LOCALE = "pt-AO";
export const SITE_OG_LOCALE = "pt_AO";

// Fixed rather than derived from the build time. A lastmod that advances on
// every deployment signals content changes that did not occur.
export const CONTENT_LAST_MODIFIED = "2026-08-19";
