"use client";

import { useEffect, useRef } from "react";

type CursorMode = "free" | "text";

// Two states only: a plain dot, and the caret bar over anything typeable. The
// shape is sprung between them rather than swapped, which is what made the
// original transition read as smooth.
const BASE = {
  free: { width: 16, height: 16, radius: 8 },
  text: { width: 3, height: 28, radius: 1.5 },
} as const;

const SPRING_STIFFNESS = 220;
const SPRING_DAMPING = 24;

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
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = elRef.current;
    if (!el) return;

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

    let width: number = BASE.free.width;
    let height: number = BASE.free.height;
    let radius: number = BASE.free.radius;
    let widthVel = 0;
    let heightVel = 0;
    let radiusVel = 0;

    let lastTimestamp = performance.now();
    let rafId = 0;
    let running = true;

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return "free";
      if (
        target.closest('input, textarea, [contenteditable="true"], [data-cursor="text"]')
      ) {
        return "text";
      }
      return "free";
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        x = e.clientX;
        y = e.clientY;
        el.style.opacity = "1";
      }
      targetX = e.clientX;
      targetY = e.clientY;
      mode = resolveMode(e.target);
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
      el.style.opacity = "0";
      stopLoop();
    };

    const handlePointerEnterViewport = () => {
      if (hasMoved) el.style.opacity = "1";
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

      const base = BASE[mode];

      if (reduceMotion) {
        width = base.width;
        height = base.height;
        radius = base.radius;
      } else {
        const dtSec = Math.min(0.032, dt / 1000);
        [width, widthVel] = stepSpring(width, widthVel, base.width, dtSec);
        [height, heightVel] = stepSpring(height, heightVel, base.height, dtSec);
        [radius, radiusVel] = stepSpring(radius, radiusVel, base.radius, dtSec);
      }

      el.style.transform = `translate3d(${(x - width / 2).toFixed(2)}px, ${(y - height / 2).toFixed(2)}px, 0)`;
      el.style.width = `${width.toFixed(2)}px`;
      el.style.height = `${height.toFixed(2)}px`;
      el.style.borderRadius = `${radius.toFixed(2)}px`;

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

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-999 bg-black will-change-transform"
      style={{ opacity: 0 }}
    />
  );
}

export { CustomCursor };
