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
const COUNT_DURATION = 0.8;
const SWAP_DURATION = 0.08;
const MORPH_DURATION = 0.4;
const HOLD = 0.08;
const LIFT_DURATION = 0.45;

// The glyph box occupies 153.6 of the 169.6-unit viewBox, so an SVG sized to
// this fraction of the counter's font size matches the text it replaces.
const SVG_HEIGHT_RATIO = 169.6 / 200;
const SVG_ASPECT = 374.4 / 169.6;

function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const bar = barRef.current;
      const readout = readoutRef.current;
      const text = textRef.current;
      const svg = svgRef.current;
      const path = pathRef.current;
      if (!root || !bar || !readout || !text || !svg || !path) return;

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
        readout.style.left = `${p * 100}%`;
        text.textContent = String(Math.round(p * 100)).padStart(2, "0");
      };
      render();

      const tl = gsap.timeline({ onComplete: dismiss });

      tl.to(progress, {
        value: 1,
        duration: COUNT_DURATION,
        ease: "power1.inOut",
        onUpdate: render,
      })
        // Both states render "100" in the same face at the same size, so the
        // exchange reads as a settle rather than a substitution.
        .to(text, { opacity: 0, duration: SWAP_DURATION }, ">-0.02")
        .to(svg, { opacity: 1, duration: SWAP_DURATION }, "<")
        .to(
          path,
          {
            morphSVG: { shape: LOGO_PATH, shapeIndex: "auto" },
            duration: MORPH_DURATION,
            ease: "power2.inOut",
          },
          ">-0.02"
        )
        .to(
          root,
          {
            yPercent: -100,
            duration: LIFT_DURATION,
            ease: "power3.inOut",
            onStart: reveal,
          },
          `>+${HOLD}`
        );

      return () => {
        tl.kill();
        setScrollLocked(false);
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="preloader-panel fixed inset-0 z-100 bg-black will-change-transform"
    >
      <div className="absolute inset-x-0 bottom-[7vh]">
        {/* Track and readout share one horizontal axis: the readout is placed
            at the progress point and pulled back by its own width, so its
            right edge stays on the bar's leading edge throughout. */}
        <div className="relative h-[clamp(10px,2vh,20px)] overflow-hidden">
          <div
            ref={barRef}
            className="absolute inset-0 origin-left bg-white will-change-transform"
          />
        </div>

        <div
          ref={readoutRef}
          className="absolute bottom-[calc(clamp(10px,2vh,20px)+0.35em)] left-0 -translate-x-full pr-[0.1em]"
        >
          <span
            ref={textRef}
            className="block font-heading text-[clamp(72px,17vh,200px)] leading-none font-light text-white tabular-nums"
          >
            00
          </span>
          <svg
            ref={svgRef}
            viewBox={MORPH_VIEW_BOX}
            fill="none"
            className="absolute right-0 bottom-0 opacity-0"
            style={{
              height: `calc(clamp(72px, 17vh, 200px) * ${SVG_HEIGHT_RATIO})`,
              width: `calc(clamp(72px, 17vh, 200px) * ${SVG_HEIGHT_RATIO * SVG_ASPECT})`,
            }}
          >
            <path ref={pathRef} d={NUMBER_PATH} fill="#ffffff" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export { Preloader };
