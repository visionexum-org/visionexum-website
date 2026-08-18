"use client";

import { useGSAP } from "@gsap/react";

import { gsap, SplitText } from "@/lib/gsap";

const PRELOADER_LAYERS = [".preloader-progress", ".preloader-mask", ".preloader-content"];
const HERO_TARGETS = [".hero-bg", ".hero-heading", ".hero-cta-item", ".hero-card"];
const FONT_WAIT_CAP_MS = 2000;

// Lives at the page root, outside VirtualScroll: the scroll track carries a
// transform, which would otherwise anchor these fixed layers to the track
// instead of the viewport and trap them below the navbar's stacking context.
// It drives the hero's entrance too, so the reveal and the content landing
// stay on one timeline.
function HeroIntro() {
  // Deliberately unscoped: the timeline reaches the hero's own elements,
  // which live outside this component's subtree.
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isMotion: "(prefers-reduced-motion: no-preference)",
        isReduced: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isMotion } = context.conditions as { isMotion: boolean };

        if (!isMotion) {
          gsap.set(PRELOADER_LAYERS, { display: "none" });
          gsap.set(HERO_TARGETS, { clearProps: "all" });
          return;
        }

        let tl: gsap.core.Timeline | null = null;
        let splits: SplitText[] = [];
        let cancelled = false;

        // SplitText measures line boxes, so it has to run against the real
        // webfonts — splitting before they land bakes in fallback metrics.
        // Capped, though: on a slow connection this is the only thing holding
        // the reveal, and a visitor stuck on a frozen preloader is worse than
        // one line breaking against fallback metrics.
        const fontsSettled = Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, FONT_WAIT_CAP_MS)),
        ]);

        fontsSettled.then(() => {
          if (cancelled) return;

          const logoChars = SplitText.create(".preloader-logo h1", {
            type: "chars",
            mask: "chars",
            charsClass: "preloader-char",
          });
          const footerLines = SplitText.create(".preloader-footer p", {
            type: "lines",
            mask: "lines",
            linesClass: "preloader-line",
          });
          const headingLines = SplitText.create(".hero-heading", {
            type: "lines",
            mask: "lines",
            linesClass: "hero-heading-line",
          });
          splits = [logoChars, footerLines, headingLines];

          gsap.set(logoChars.chars, { x: "100%" });
          gsap.set([footerLines.lines, headingLines.lines], { y: "100%" });
          gsap.set(".hero-bg", { scale: 1.5 });
          gsap.set(".hero-cta-item", { scale: 0 });
          // opacity 0.001, not 0: at exactly 0 Chromium drops the element's
          // compositing layer, so the backdrop-blur child is recomposited
          // from scratch as it fades back in — a visible beat behind the
          // rest of the entrance.
          gsap.set(".hero-card", { y: 32, opacity: 0.001 });

          const animateProgress = (duration = 1.2) => {
            const progress = gsap.timeline();
            const counterSteps = 5;
            let currentProgress = 0;

            for (let i = 0; i < counterSteps; i++) {
              const finalStep = i === counterSteps - 1;
              const targetProgress = finalStep
                ? 1
                : Math.min(currentProgress + Math.random() * 0.3 + 0.1, 0.9);
              currentProgress = targetProgress;

              progress.to(".preloader-progress-bar", {
                scaleX: targetProgress,
                duration: duration / counterSteps,
                ease: "power2.out",
              });
            }

            return progress;
          };

          tl = gsap.timeline({ delay: 0.2 });

          tl.to(logoChars.chars, {
            x: "0%",
            stagger: 0.03,
            duration: 0.6,
            ease: "power4.inOut",
          })
            .to(
              footerLines.lines,
              { y: "0%", stagger: 0.06, duration: 0.6, ease: "power4.inOut" },
              "0.15"
            )
            .add(animateProgress(), "<")
            .set(".preloader-progress", { backgroundColor: "#ffffff" })
            .to(
              logoChars.chars,
              { x: "-100%", stagger: 0.03, duration: 0.6, ease: "power4.inOut" },
              "-=0.3"
            )
            .to(
              footerLines.lines,
              { y: "-100%", stagger: 0.06, duration: 0.6, ease: "power4.inOut" },
              "<"
            )
            .to(
              ".preloader-progress",
              { opacity: 0, duration: 0.4, ease: "power3.out" },
              "-=0.2"
            )
            .to(".preloader-mask", { scale: 6, duration: 1.6, ease: "power3.out" }, "<")
            .to(".hero-bg", { scale: 1, duration: 1.2, ease: "power3.out" }, "<")
            .to(
              headingLines.lines,
              { y: 0, stagger: 0.08, duration: 0.8, ease: "power4.out" },
              "-=1.3"
            )
            .to(
              ".hero-cta-item",
              { scale: 1, stagger: 0.08, duration: 0.7, ease: "power4.out" },
              "-=0.55"
            )
            .to(
              ".hero-card",
              { y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: "power4.out" },
              "-=0.6"
            )
            .set(PRELOADER_LAYERS, { display: "none" });
        });

        return () => {
          cancelled = true;
          tl?.kill();
          splits.forEach((split) => split.revert());
        };
      }
    );

    return () => mm.revert();
  });

  return (
    <div aria-hidden="true">
      <div className="preloader-progress">
        <div className="preloader-progress-bar" />
        <div className="preloader-logo">
          <h1 className="font-heading text-5xl leading-none font-medium text-white">
            Visio Nexum
          </h1>
        </div>
      </div>

      <div className="preloader-mask" />

      <div className="preloader-content">
        <div className="preloader-footer">
          <p className="font-sans text-sm text-white/50">
            Percepção medida, posicionamento provado — a vantagem que o mercado
            reconhece antes de comprar.
          </p>
        </div>
      </div>
    </div>
  );
}

export { HeroIntro };
