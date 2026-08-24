import { headers } from "next/headers";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { VirtualScroll } from "@/components/shared/virtual-scroll";
import { Preloader } from "@/components/shared/preloader";
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
      {/* Runs synchronously before hydration: applying overflow:hidden here
          rather than in the virtual-scroll effect keeps a layout reflow from
          landing mid-animation. It belongs to this route rather than the
          layout, since the class locks the body to 100dvh and would leave any
          page without VirtualScroll unable to scroll. */}
      <script
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{
          __html: "document.body.classList.add('virtual-scroll-active')",
        }}
      />
      {/* Outside VirtualScroll: the scroll track carries a transform, which
          would make a fixed child resolve against the track rather than the
          viewport. */}
      <Preloader />
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
