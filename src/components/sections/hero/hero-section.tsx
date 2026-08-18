import { SectionContainer } from "@/components/shared/section-container";
import { HeroBackground } from "@/components/sections/hero/hero-background";
import { HeroContent } from "@/components/sections/hero/hero-content";
import { HeroCards } from "@/components/sections/hero/hero-cards";

// The entrance for everything in here is driven by HeroIntro, which owns the
// single reveal timeline shared with the preloader.
function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-[950px] flex-col justify-center overflow-hidden rounded-b-[32px] bg-navy pt-36 pb-20 lg:min-h-screen lg:pt-40 lg:pb-24"
    >
      <HeroBackground />

      {/* Hero's own 1920px reference canvas (1728px content, 96px
          gutters), distinct from the sitewide 1440px canvas SectionContainer
          uses elsewhere — both pieces below share max-w-480 so they align at
          any viewport. No padding here: an absolutely positioned child
          measures inset/left/right against the parent's padding box,
          silently ignoring the parent's own padding, so HeroContent bakes
          its 96px gutter into lg:left-24 instead. absolute+inset-0 only from
          lg — below that this must stay in flow, or it stops contributing
          height and HeroContent floats over the cards instead of stacking
          above them. */}
      <div className="relative z-10 mx-auto max-w-480 lg:absolute lg:inset-0">
        <HeroContent />
      </div>

      <SectionContainer className="relative z-10 max-w-480 px-6 lg:flex lg:justify-end lg:px-24">
        <HeroCards />
      </SectionContainer>
    </section>
  );
}

export { HeroSection };
