"use client";

import { useRef, useEffect } from "react";

import { gsap, SplitText } from "@/lib/gsap";
import { SectionContainer } from "@/components/shared/section-container";
import { HeroBackground } from "@/components/sections/hero/hero-background";
import { HeroContent } from "@/components/sections/hero/hero-content";
import { HeroCards } from "@/components/sections/hero/hero-cards";

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktopMotion:
          "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isDesktopMotion } = context.conditions as {
          isDesktopMotion: boolean;
        };

        if (!isDesktopMotion) {
          gsap.set(
            [".hero-preloader-progress", ".hero-preloader-mask", ".hero-bg", ".hero-heading", ".hero-cta-item", ".hero-card"],
            { clearProps: "all" }
          );
          return;
        }

        // Split texts
        const headingEl = sectionRef.current?.querySelector<HTMLElement>(
          ".hero-heading"
        );
        const headingSplit = headingEl
          ? SplitText.create(headingEl, {
              type: "lines",
              mask: "lines",
              linesClass: "hero-heading-line",
            })
          : null;

        // Timeline for reveal animation
        const tl = gsap.timeline({ delay: 0.3 });

        // Progress bar animation
        tl.to(".hero-preloader-progress-bar", {
          scaleX: 1,
          duration: 1.5,
          ease: "power2.out",
        })
          // Fade out progress
          .to(
            ".hero-preloader-progress",
            { opacity: 0, duration: 0.5, ease: "power3.out" },
            "-=0.5"
          )
          // Mask expands and background images scale in
          .to(
            ".hero-preloader-mask",
            { scale: 6, duration: 2, ease: "power3.out" },
            "<"
          )
          .to(
            ".hero-bg",
            { scale: 1, opacity: 1, duration: 1.5, ease: "power3.out" },
            "<"
          )
          // Elements fade in as mask expands
          .from(
            ".hero-heading-line",
            { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.1 },
            "-=1.2"
          )
          .from(
            ".hero-cta-item",
            { y: 16, opacity: 0, duration: 0.6, stagger: 0.1 },
            "-=0.7"
          )
          .from(
            ".hero-card",
            { y: 32, opacity: 0.001, duration: 0.8, stagger: 0.12 },
            "-=0.4"
          );

        return () => {
          tl.kill();
          headingSplit?.revert();
          mm.revert();
        };
      }
    );
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-[950px] flex-col justify-center overflow-hidden rounded-b-[32px] bg-navy pt-36 pb-20 lg:min-h-screen lg:pt-40 lg:pb-24"
    >
      {/* Preloader progress */}
      <div className="hero-preloader-progress pointer-events-none fixed inset-0 z-50 bg-white/10" aria-hidden="true">
        <div
          className="hero-preloader-progress-bar absolute top-0 left-1/2 h-full w-1/2 bg-white"
          style={{
            transform: "translateX(-50%) scaleX(0)",
            transformOrigin: "left",
            willChange: "transform",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Preloader mask */}
      <div
        className="hero-preloader-mask pointer-events-none fixed inset-0 z-40 bg-navy"
        style={{
          maskImage: 'linear-gradient(white, white), url("/hero-mask.svg") center/50% no-repeat',
          WebkitMaskImage: 'linear-gradient(white, white), url("/hero-mask.svg") center/50% no-repeat',
          maskComposite: "subtract",
          WebkitMaskComposite: "subtract",
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      <HeroBackground />

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
