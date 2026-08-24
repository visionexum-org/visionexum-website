"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, SplitText } from "@/lib/gsap";
import { PRELOADER_REVEAL_EVENT } from "@/components/shared/preloader";
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

          // Held until the preloader begins to lift, so the entrance plays
          // into view rather than completing behind the panel. The fallback
          // covers the panel being absent or failing to dispatch.
          const tl = gsap.timeline({
            paused: true,
            defaults: { ease: "power3.out" },
          });

          const play = () => tl.play();
          window.addEventListener(PRELOADER_REVEAL_EVENT, play, { once: true });
          const fallback = window.setTimeout(play, 2400);

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
              // 0.001 rather than 0: at exactly 0 Chromium discards the
              // compositing layer, requiring the backdrop-blur child to be
              // recomposited as it fades back in, which lags the entrance.
              { y: 32, opacity: 0.001, duration: 0.8, stagger: 0.12 },
              "-=0.5"
            );

          return () => {
            window.removeEventListener(PRELOADER_REVEAL_EVENT, play);
            window.clearTimeout(fallback);
            tl.kill();
            split?.revert();
          };
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // At mobile widths the content is anchored to the bottom of a single
  // viewport rather than centred within a fixed height, which keeps the
  // composition tight to the screen. min-h-dvh acts as a floor, so the section
  // still grows where the content requires it.
  return (
    <section
      id="home"
      ref={sectionRef}
      data-cursor-tone="light"
      className="relative flex min-h-dvh flex-col justify-end overflow-hidden bg-navy pt-28 pb-12 lg:min-h-screen lg:justify-center lg:pt-40 lg:pb-24"
    >
      <HeroBackground />

      {/* The hero uses a 1920px reference canvas (1728px of content within 96px
          gutters), distinct from the 1440px canvas SectionContainer applies
          elsewhere; both elements below share max-w-480 so they align at any
          viewport. No padding is set here: an absolutely positioned child
          resolves inset values against the parent's padding box and disregards
          its padding, so HeroContent carries the 96px gutter in lg:left-24.
          The absolute positioning applies from lg upward only; below that this
          element must remain in flow, or it ceases to contribute height and
          HeroContent overlaps the cards rather than stacking above them. */}
      <div className="relative z-10 mx-auto max-w-480 lg:absolute lg:inset-0">
        <HeroContent />
      </div>

      {/* Desktop only: the mobile composition is photo, heading and the two
          CTAs across a single screen. */}
      <SectionContainer className="relative z-10 hidden max-w-480 px-6 lg:flex lg:justify-end lg:px-24">
        <HeroCards />
      </SectionContainer>
    </section>
  );
}

export { HeroSection };
