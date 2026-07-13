import type { Metadata } from "next";
import { manrope, sora } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visio Nexum — Construímos a fundação da sua percepção",
  description:
    "Ajudamos PMEs angolanas a transformar percepção numa vantagem estratégica mensurável — através do Visio Method™.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${manrope.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
