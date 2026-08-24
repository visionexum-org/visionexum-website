"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap } from "@/lib/gsap";
import { setScrollLocked } from "@/lib/virtual-scroll";
import {
  LOGO_PATH,
  MORPH_VIEW_BOX,
  NUMBER_PATH,
} from "@/lib/preloader-shapes";

// Emitted as the panel begins to lift, so the hero entrance runs behind the
// reveal rather than finishing out of sight beneath it.
export const PRELOADER_REVEAL_EVENT = "preloader:revealing";

// The full sequence is budgeted to stay under two seconds.
const SWAP_DURATION = 0.06;
const MORPH_DURATION = 0.35;
const HOLD = 0.06;
const REVEAL_DURATION = 0.52;

// Uneven by design: a loader advancing at a constant rate reads as a
// decorative timer rather than as work being done. The second segment holds
// back before the run to completion.
const COUNT_KEYFRAMES = [
  { value: 0.34, duration: 0.17, ease: "power2.out" },
  { value: 0.46, duration: 0.22, ease: "power1.inOut" },
  { value: 0.88, duration: 0.17, ease: "power2.in" },
  { value: 1, duration: 0.14, ease: "power2.out" },
];

// The glyph box occupies 153.6 of the 169.6-unit viewBox, so an element sized
// to this fraction of the counter's font size matches the text it replaces.
const SVG_HEIGHT_RATIO = 169.6 / 200;
const SVG_ASPECT = 374.4 / 169.6;

// The mark occupies 333.4 of the 374.4-unit viewBox, the remainder being the
// width the wider "100" needed. Matching the element boxes alone would land
// the mark undersized against the header logo, so the flight scales by the
// difference.
const MARK_BOX_RATIO = 374.4 / 333.4;

const COUNTER_SIZE = "clamp(72px, 17vh, 200px)";
const BAR_HEIGHT = "clamp(10px, 2vh, 20px)";

function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const panel = panelRef.current;
      const bar = barRef.current;
      const readout = readoutRef.current;
      const text = textRef.current;
      const mark = markRef.current;
      const path = pathRef.current;
      if (!root || !panel || !bar || !readout || !text || !mark || !path) return;

      const reveal = () =>
        window.dispatchEvent(new CustomEvent(PRELOADER_REVEAL_EVENT));
      const dismiss = () => {
        root.style.display = "none";
        setScrollLocked(false);
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        reveal();
        dismiss();
        return;
      }

      setScrollLocked(true);

      // A single driver keeps the bar, the readout's position and the digits
      // on exactly the same value; animating them separately lets the number
      // drift off the bar's leading edge.
      const progress = { value: 0 };
      const render = () => {
        const p = progress.value;
        bar.style.transform = `scaleX(${p})`;
        // The bar fills towards the left, so its leading edge — and the
        // readout resting against it — travels from right to left.
        readout.style.left = `${(1 - p) * 100}%`;
        text.textContent = String(Math.round(p * 100)).padStart(2, "0");
      };
      render();

      const tl = gsap.timeline();

      tl.to(progress, { keyframes: COUNT_KEYFRAMES, onUpdate: render })
        // Both states render "100" in the same face at the same size, so the
        // exchange reads as a settle rather than a substitution.
        .to(text, { opacity: 0, duration: SWAP_DURATION }, ">-0.02")
        .to(mark, { opacity: 1, duration: SWAP_DURATION }, "<")
        .to(
          path,
          {
            morphSVG: { shape: LOGO_PATH, shapeIndex: "auto" },
            duration: MORPH_DURATION,
            ease: "power2.inOut",
          },
          ">-0.02"
        )
        .add(() => {
          reveal();

          // The mark is a sibling of the panel rather than a child, so it
          // holds position as the panel clears and travels to the header
          // logo under its own animation.
          const navLogo = document.querySelector<SVGSVGElement>("[data-nav-logo]");
          if (!navLogo) {
            gsap.to(mark, { opacity: 0, duration: 0.3, onComplete: dismiss });
            return;
          }

          const from = mark.getBoundingClientRect();
          const to = navLogo.getBoundingClientRect();
          const scale = ((to.width * MARK_BOX_RATIO) / from.width) || 1;

          gsap.to(mark, {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale,
            transformOrigin: "50% 50%",
            duration: REVEAL_DURATION,
            ease: "power3.inOut",
            // Dismissal is driven from here rather than from the timeline:
            // the flight is created at runtime and outlives it, and tearing
            // the tree down on the timeline's completion would cut it short.
            onComplete: dismiss,
          });

          // Handed over only once the mark is essentially in place, so the
          // exchange with the header logo is not visible.
          gsap.to(mark, {
            opacity: 0,
            duration: 0.14,
            delay: REVEAL_DURATION - 0.14,
          });
        }, `>+${HOLD}`)
        .to(
          panel,
          { yPercent: -100, duration: REVEAL_DURATION, ease: "power3.inOut" },
          "<"
        );

      return () => {
        tl.kill();
        setScrollLocked(false);
      };
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} aria-hidden="true">
      <div
        ref={panelRef}
        className="preloader-panel fixed inset-0 z-100 bg-black will-change-transform"
      >
        <div
          className="absolute inset-x-0 overflow-hidden"
          style={{ bottom: "7vh", height: BAR_HEIGHT }}
        >
          <div
            ref={barRef}
            className="absolute inset-0 origin-right bg-white will-change-transform"
          />
        </div>
      </div>

      {/* Above the panel and outside it: the readout has to outlive the lift so
          the mark can travel to the header under its own animation. */}
      <div
        className="pointer-events-none fixed inset-x-0 z-101"
        style={{ bottom: "7vh" }}
      >
        <div
          ref={readoutRef}
          className="absolute left-full pl-[0.1em]"
          style={{ bottom: `calc(${BAR_HEIGHT} + 0.35em)` }}
        >
          <span
            ref={textRef}
            className="block font-heading leading-none font-light text-white tabular-nums"
            style={{ fontSize: COUNTER_SIZE }}
          >
            00
          </span>
          <div
            ref={markRef}
            className="absolute bottom-0 left-0 opacity-0 will-change-transform"
            style={{
              height: `calc(${COUNTER_SIZE} * ${SVG_HEIGHT_RATIO})`,
              width: `calc(${COUNTER_SIZE} * ${SVG_HEIGHT_RATIO * SVG_ASPECT})`,
            }}
          >
            <svg viewBox={MORPH_VIEW_BOX} fill="none" className="size-full">
              <path ref={pathRef} d={NUMBER_PATH} fill="#ffffff" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Preloader };
