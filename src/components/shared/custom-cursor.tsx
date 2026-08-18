"use client";

import { useEffect, useRef } from "react";

type CursorMode = "free" | "button" | "text";

const SPRING_STIFFNESS = 220;
const SPRING_DAMPING = 24;

// Dipped on every mode change, then sprung back to 1 so the shape swap
// registers as a deliberate beat rather than a hard cut.
const MODE_CHANGE_SCALE = 0.84;

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
  const handRef = useRef<SVGSVGElement>(null);
  const beamRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = rootRef.current;
    const shapes = {
      free: arrowRef.current,
      button: handRef.current,
      text: beamRef.current,
    };
    if (!root || !shapes.free || !shapes.button || !shapes.text) return;

    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
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
    let scale = 1;
    let scaleVel = 0;
    const opacity: Record<CursorMode, number> = { free: 1, button: 0, text: 0 };
    const opacityVel: Record<CursorMode, number> = { free: 0, button: 0, text: 0 };

    let lastTimestamp = performance.now();
    let rafId = 0;
    let running = true;

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return "free";
      if (target.closest('input, textarea, [contenteditable="true"], [data-cursor="text"]')) {
        return "text";
      }
      if (target.closest('a, button, [role="button"], [data-cursor="button"]')) {
        return "button";
      }
      return "free";
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
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
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

      if (reduceMotion) {
        scale = 1;
      } else {
        [scale, scaleVel] = stepSpring(scale, scaleVel, 1, dtSec);
      }

      (Object.keys(shapes) as CursorMode[]).forEach((key) => {
        const target = key === mode ? 1 : 0;
        if (reduceMotion) {
          opacity[key] = target;
        } else {
          [opacity[key], opacityVel[key]] = stepSpring(
            opacity[key],
            opacityVel[key],
            target,
            dtSec
          );
        }
        shapes[key]!.style.opacity = opacity[key].toFixed(3);
      });

      root.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;

      if (running) {
        rafId = requestAnimationFrame(tick);
      }
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

  // Each shape is offset so its own hotspot lands on the container origin,
  // which keeps the animation loop free of per-mode positioning maths. The
  // navy outline is what a solid fill needs to stay legible over both the
  // navy and the cream sections, now that mix-blend-difference is gone.
  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-999 will-change-transform"
      style={{ opacity: 0 }}
    >
      <svg
        ref={arrowRef}
        width="17"
        height="22"
        viewBox="0 0 17 22"
        fill="none"
        className="absolute top-0 left-0"
        style={{ transform: "translate(-1.5px, -1.5px)" }}
      >
        <path
          d="M1.5 1.5V17.4L6 13.6L8.7 20L11.6 18.8L8.9 12.6L14.6 12.3Z"
          className="fill-white stroke-navy"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        ref={handRef}
        width="24"
        height="27"
        viewBox="0 0 24 27"
        fill="none"
        className="absolute top-0 left-0"
        style={{ transform: "translate(-7px, -1.5px)" }}
      >
        <path
          d="M7.4 13.2V4.1a1.8 1.8 0 0 1 3.6 0v6.6V9.2a1.7 1.7 0 0 1 3.4 0v1.6a1.7 1.7 0 0 1 3.4 0v1.2a1.7 1.7 0 0 1 3.4 0v4.9c0 4-2.7 6.9-6.7 6.9h-2.2c-2.3 0-3.8-.9-5.1-2.7l-4.3-6a1.8 1.8 0 0 1 2.7-2.3z"
          className="fill-white stroke-navy"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        ref={beamRef}
        width="12"
        height="26"
        viewBox="0 0 12 26"
        fill="none"
        className="absolute top-0 left-0"
        style={{ transform: "translate(-6px, -13px)" }}
      >
        <path
          d="M3 3h6M6 3v20M3 23h6"
          className="stroke-navy"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d="M3 3h6M6 3v20M3 23h6"
          className="stroke-white"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export { CustomCursor };
