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
              [".hero-intro-overlay", ".hero-bg", ".hero-heading", ".hero-cta-item", ".hero-card"],
              { clearProps: "all" }
            );
            return;
          }

          const overlay = sectionRef.current?.querySelector<HTMLElement>(
            ".hero-intro-overlay"
          );
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

          const tl = gsap.timeline({ delay: 0.2 });

          // Intro: white overlay fades, circular mask expands from center revealing background
          tl.to(".hero-intro-overlay", { opacity: 0, duration: 0.5, ease: "power2.inOut" })
            .to(
              ".hero-intro-reveal",
              {
                scale: 4,
                duration: 1.2,
                ease: "power3.out",
              },
              "<"
            )
            .to(
              ".hero-intro-reveal",
              { opacity: 0, duration: 0.4, pointerEvents: "none" },
              "-=0.3"
            )
            // Elements fade in as mask expands
            .from(
              ".hero-bg",
              { opacity: 0, scale: 1.05, duration: 0.8 },
              0
            )
            .from(
              ".hero-heading-line",
              { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.08 },
              0.3
            )
            .from(
              ".hero-cta-item",
              { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 },
              0.5
            )
            .from(
              ".hero-card",
              { y: 32, opacity: 0.001, duration: 0.6, stagger: 0.1 },
              0.65
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

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-[950px] flex-col justify-center overflow-hidden rounded-b-[32px] bg-navy pt-36 pb-20 lg:min-h-screen lg:pt-40 lg:pb-24"
    >
      <div
        className="hero-intro-overlay pointer-events-none fixed inset-0 z-50 bg-white"
        aria-hidden="true"
      />
      <div
        className="hero-intro-reveal pointer-events-none fixed inset-0 z-50 bg-navy"
        style={{
          borderRadius: "50%",
          transform: "scale(0)",
          transformOrigin: "center center",
        }}
        aria-hidden="true"
      />

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
