"use client";

import { useEffect, useRef } from "react";

type CursorMode = "free" | "text";

// The brand pointer, inlined rather than referenced as a file so its fill can
// follow currentColor. The shape is rendered in black or white according to
// the surface beneath it.
const POINTER_PATH =
  "M196.009 6.03347C195.945 6.01398 195.129 5.8158 192.207 6.65045C189.39 7.45507 185.66 8.88379 180.181 10.9923L24.482 70.9125C18.024 73.3978 13.5542 75.1231 10.4268 76.6474C7.09749 78.27 6.60057 79.0816 6.61045 79.0635C5.81352 80.5245 5.79595 82.2866 6.56327 83.7634C6.57814 83.7848 7.11301 84.6065 10.33 86.2555C13.426 87.8424 17.86 89.6581 24.2664 92.2729L83.6031 116.492C85.6414 117.324 87.5006 118.049 89.1464 119.185C90.5531 120.156 91.8053 121.334 92.8608 122.678C94.0956 124.251 94.9328 126.062 95.8883 128.046L123.703 185.785C126.706 192.019 128.79 196.333 130.564 199.326C132.407 202.435 133.26 202.919 133.282 202.932C134.804 203.608 136.561 203.482 137.971 202.597C137.953 202.608 138.733 202.062 140.148 198.639C141.478 195.424 142.925 190.857 145.01 184.259L195.264 25.1767C197.033 19.5788 198.23 15.7683 198.86 12.9072C199.514 9.93928 199.266 9.13722 199.243 9.07433C198.698 7.61152 197.502 6.48688 196.009 6.03347Z";

// Dark surfaces carry data-cursor-tone="light", against which the pointer is
// rendered in white.
const DARK_SURFACE = '[data-cursor-tone="light"]';
const TONE_ON_DARK = "#ffffff";
const TONE_ON_LIGHT = "#000000";

const SPRING_STIFFNESS = 220;
const SPRING_DAMPING = 24;

// Reduced on each shape change and sprung back to 1, so the transition
// between pointer and caret bar registers as a transition rather than a cut.
const MODE_CHANGE_SCALE = 0.8;

function stepSpring(
  current: number,
  velocity: number,
  target: number,
  dtSec: number
): [number, number] {
  const force = (target - current) * SPRING_STIFFNESS - velocity * SPRING_DAMPING;
  const nextVelocity = velocity + force * dtSec;
  const nextCurrent = current + nextVelocity * dtSec;
  return [nextCurrent, nextVelocity];
}

function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = rootRef.current;
    const arrow = arrowRef.current;
    const bar = barRef.current;
    if (!root || !arrow || !bar) return;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = reduceMotionQuery.matches;
    const onReduceMotionChange = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches;
    };
    reduceMotionQuery.addEventListener("change", onReduceMotionChange);

    document.body.classList.add("custom-cursor-active");

    let hasMoved = false;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;

    let mode: CursorMode = "free";
    let tone = TONE_ON_LIGHT;
    let scale = 1;
    let scaleVel = 0;
    let arrowOpacity = 1;
    let arrowVel = 0;
    let barOpacity = 0;
    let barVel = 0;

    let lastTimestamp = performance.now();
    let rafId = 0;
    let running = true;

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return "free";
      return target.closest('input, textarea, [contenteditable="true"], [data-cursor="text"]')
        ? "text"
        : "free";
    };

    const resolveTone = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return TONE_ON_LIGHT;
      return target.closest(DARK_SURFACE) ? TONE_ON_DARK : TONE_ON_LIGHT;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        x = e.clientX;
        y = e.clientY;
        root.style.opacity = "1";
      }
      targetX = e.clientX;
      targetY = e.clientY;

      const nextMode = resolveMode(e.target);
      if (nextMode !== mode) {
        mode = nextMode;
        if (!reduceMotion) {
          scale = MODE_CHANGE_SCALE;
          scaleVel = 0;
        }
      }

      const nextTone = resolveTone(e.target);
      if (nextTone !== tone) {
        tone = nextTone;
        root.style.color = tone;
      }
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      lastTimestamp = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const handlePointerLeaveViewport = () => {
      root.style.opacity = "0";
      stopLoop();
    };

    const handlePointerEnterViewport = () => {
      if (hasMoved) root.style.opacity = "1";
      startLoop();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handlePointerLeaveViewport);
    document.documentElement.addEventListener("mouseenter", handlePointerEnterViewport);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const tick = (timestamp: number) => {
      const dt = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (reduceMotion) {
        x = targetX;
        y = targetY;
      } else {
        const factor = 1 - Math.pow(0.72, dt / 16.667);
        x += (targetX - x) * factor;
        y += (targetY - y) * factor;
      }

      const dtSec = Math.min(0.032, dt / 1000);
      const wantArrow = mode === "free" ? 1 : 0;
      const wantBar = mode === "text" ? 1 : 0;

      if (reduceMotion) {
        scale = 1;
        arrowOpacity = wantArrow;
        barOpacity = wantBar;
      } else {
        [scale, scaleVel] = stepSpring(scale, scaleVel, 1, dtSec);
        [arrowOpacity, arrowVel] = stepSpring(arrowOpacity, arrowVel, wantArrow, dtSec);
        [barOpacity, barVel] = stepSpring(barOpacity, barVel, wantBar, dtSec);
      }

      arrow.style.opacity = arrowOpacity.toFixed(3);
      bar.style.opacity = barOpacity.toFixed(3);
      root.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;

      if (running) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      stopLoop();
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeaveViewport);
      document.documentElement.removeEventListener("mouseenter", handlePointerEnterViewport);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reduceMotionQuery.removeEventListener("change", onReduceMotionChange);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  // Each shape offsets itself to its own hotspot, so the loop above handles
  // only the raw pointer position. The pointer's tip is its top-right corner;
  // the caret bar is centred.
  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-999 transition-[color] duration-200 ease-out will-change-transform"
      style={{ opacity: 0, color: TONE_ON_LIGHT }}
    >
      {/* transform-origin sits at the element's corner and the translate is
          applied before the rotate, so the tip resolves to the pointer position
          and the rotation pivots about that point. */}
      <svg
        ref={arrowRef}
        width="18"
        height="18.35"
        viewBox="0 0 206 210"
        fill="none"
        className="absolute top-0 left-0"
        style={{
          transformOrigin: "0 0",
          transform: "rotate(-20deg) translate(-17px, -0.43px)",
        }}
      >
        <path
          d={POINTER_PATH}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinejoin="bevel"
        />
      </svg>

      <div
        ref={barRef}
        className="absolute top-0 left-0 w-[3px] rounded-full"
        style={{
          height: "28px",
          backgroundColor: "currentColor",
          transform: "translate(-1.5px, -14px)",
          opacity: 0,
        }}
      />
    </div>
  );
}

export { CustomCursor };
