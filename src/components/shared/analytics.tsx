import Script from "next/script";

// Renders nothing until NEXT_PUBLIC_GA_ID is configured, so the site ships
// without analytics until a measurement ID exists. Both tags carry the
// per-request nonce: the CSP uses strict-dynamic, under which the gtag.js
// loaded by the nonced inline snippet inherits its trust.
function Analytics({ nonce }: { nonce?: string }) {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="ga-init" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}

export { Analytics };
