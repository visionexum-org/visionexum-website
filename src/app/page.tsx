import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/sections/hero/hero-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
      </main>
    </>
  );
}
