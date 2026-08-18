"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, SplitText } from "@/lib/gsap";
import { SectionContainer } from "@/components/shared/section-container";
import { HeroBackground } from "@/components/sections/hero/hero-background";
import { HeroContent } from "@/components/sections/hero/hero-content";
import { HeroCards } from "@/components/sections/hero/hero-cards";

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktopMotion:
            "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          isReducedOrMobile:
            "(max-width: 1023px), (prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktopMotion } = context.conditions as {
            isDesktopMotion: boolean;
          };

          if (!isDesktopMotion) {
            gsap.set(
              [".hero-bg", ".hero-heading", ".hero-cta-item", ".hero-card"],
              { clearProps: "all" }
            );
            return;
          }

          const heading = sectionRef.current?.querySelector<HTMLElement>(
            ".hero-heading"
          );
          const split = heading
            ? SplitText.create(heading, {
                type: "lines",
                mask: "lines",
                linesClass: "hero-heading-line",
              })
            : null;

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          tl.from(".hero-bg", { opacity: 0, scale: 1.06, duration: 1.2 })
            .from(
              ".hero-heading-line",
              { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.12 },
              "-=0.7"
            )
            .from(
              ".hero-cta-item",
              { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 },
              "-=0.4"
            )
            .from(
              ".hero-card",
              // opacity 0.001, not 0: at exactly 0, Chromium drops the
              // element's compositing layer entirely, so the backdrop-blur
              // child has to be recomposited from scratch as it fades back
              // in — a visible beat behind the rest of the entrance.
              { y: 32, opacity: 0.001, duration: 0.8, stagger: 0.12 },
              "-=0.5"
            );

          return () => {
            tl.kill();
            split?.revert();
          };
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Mobile anchors its content to the bottom of one viewport rather than
  // centring it inside a fixed 950px box: that box was taller than a phone
  // screen, so it opened a dead band between the navbar and the heading and
  // pushed the second card out of view. min-h-dvh is a floor, so the section
  // still grows if the content needs more room than that.
  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-dvh flex-col justify-end overflow-hidden bg-navy pt-28 pb-12 lg:min-h-screen lg:justify-center lg:pt-40 lg:pb-24"
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

      {/* Desktop only: the mobile design is photo, heading and the two CTAs
          over a single screen, with no glass cards. */}
      <SectionContainer className="relative z-10 hidden max-w-480 px-6 lg:flex lg:justify-end lg:px-24">
        <HeroCards />
      </SectionContainer>
    </section>
  );
}

export { HeroSection };
