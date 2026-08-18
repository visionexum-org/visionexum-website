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

export default function Home() {
  return (
    <>
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
