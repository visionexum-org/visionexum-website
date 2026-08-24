import type { Metadata } from "next";
import { headers } from "next/headers";
import { manrope, sora } from "@/lib/fonts";
import { CustomCursor } from "@/components/shared/custom-cursor";
import { Analytics } from "@/components/shared/analytics";
import { siteStructuredData } from "@/lib/structured-data";
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_OG_LOCALE,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "business",
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
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Populated from the environment so the property can be verified without a
  // code change. Next omits the tag entirely when the value is absent.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    locale: SITE_OG_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — arquitectura de percepção para PMEs em Angola`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce");

  return (
    <html
      lang={SITE_LOCALE}
      className={`${manrope.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          nonce={nonce ?? undefined}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData) }}
        />
        {/* Compiles Chrome's backdrop-filter GPU shader during the first paint.
            The compile is a one-time page-wide cost; without this element the
            hero's glass cards incur it as they render, appearing unblurred for
            a frame. Server-rendered at 1x1px, so it requires no JavaScript and
            is present from the first byte of HTML. */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 size-px overflow-hidden"
          style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        />
        <CustomCursor />
        {children}
        <Analytics nonce={nonce ?? undefined} />
      </body>
    </html>
  );
}
