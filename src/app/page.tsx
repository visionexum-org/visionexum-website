import { headers } from "next/headers";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { VirtualScroll } from "@/components/shared/virtual-scroll";
import { HeroSection } from "@/components/sections/hero/hero-section";
import { ManifestoSection } from "@/components/sections/manifesto/manifesto-section";
import { SobreNosSection } from "@/components/sections/sobre-nos/sobre-nos-section";
import { MetodoSection } from "@/components/sections/metodo/metodo-section";
import { ServicosSection } from "@/components/sections/servicos/servicos-section";
import { VisioScoreSection } from "@/components/sections/visio-score/visio-score-section";
import { FaqSection } from "@/components/sections/faq/faq-section";
import { ContatoSection } from "@/components/sections/contato/contato-section";

export default async function Home() {
  const nonce = (await headers()).get("x-nonce");

  return (
    <>
      {/* Runs synchronously before hydration: applying overflow:hidden here,
          not in the virtual-scroll effect, avoids a layout reflow landing
          mid-animation and invalidating the hero cards' backdrop-blur
          compositing layer as they fade in. It belongs to this route rather
          than the layout — the class locks the body to 100dvh, which leaves
          any page without VirtualScroll unable to scroll. */}
      <script
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{
          __html: "document.body.classList.add('virtual-scroll-active')",
        }}
      />
      <Navbar />
      <VirtualScroll>
        <main>
          <HeroSection />
          <ManifestoSection />
          <SobreNosSection />
          <MetodoSection />
          <ServicosSection />
          <VisioScoreSection />
          <FaqSection />
          <ContatoSection />
        </main>
        <Footer />
      </VirtualScroll>
    </>
  );
}
