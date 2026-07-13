"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap } from "@/lib/gsap";
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
              [
                ".hero-bg",
                ".hero-heading-line",
                ".hero-subtext",
                ".hero-cta-item",
                ".hero-card",
              ],
              { clearProps: "all" }
            );
            return;
          }

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          tl.from(".hero-bg", { opacity: 0, scale: 1.06, duration: 1.2 })
            .from(
              ".hero-heading-line",
              { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.12 },
              "-=0.7"
            )
            .from(".hero-subtext", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5")
            .from(
              ".hero-cta-item",
              { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 },
              "-=0.4"
            )
            .from(
              ".hero-card",
              { y: 32, opacity: 0, duration: 0.8, stagger: 0.12 },
              "-=0.5"
            );

          const cards = gsap.utils.toArray<HTMLElement>(".hero-card");
          cards.forEach((card, index) => {
            gsap.to(card, {
              y: index % 2 === 0 ? -10 : -14,
              duration: 2.6 + index * 0.4,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: 1.2 + index * 0.15,
            });
          });

          return () => {
            tl.kill();
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
      className="relative min-h-[950px] overflow-hidden bg-navy pt-32 pb-20 lg:min-h-screen lg:pt-40"
    >
      <HeroBackground />

      <SectionContainer className="relative z-10 grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-8">
        <HeroContent />
        <HeroCards />
      </SectionContainer>
    </section>
  );
}

export { HeroSection };
