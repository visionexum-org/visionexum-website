import type { Metadata } from "next";
import { headers } from "next/headers";
import { manrope, sora } from "@/lib/fonts";
import { CustomCursor } from "@/components/shared/custom-cursor";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "percepção de marca",
    "consultoria de marketing Angola",
    "Visio Score",
    "Visio Method",
    "PMEs angolanas",
    "posicionamento estratégico",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description: SITE_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce");

  return (
    <html
      lang="pt"
      className={`${manrope.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          nonce={nonce ?? undefined}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Forces Chrome to compile its backdrop-filter GPU shader during
            the very first paint, server-rendered so it needs no JS. That
            compile is a one-time, page-wide cost — without this, the hero's
            glass cards pay for it live the moment they're the first thing
            on the page to use backdrop-filter, showing unblurred for a
            beat. 1x1px, present from the first byte of HTML. */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 size-px overflow-hidden"
          style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
