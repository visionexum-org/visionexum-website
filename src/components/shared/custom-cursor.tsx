"use client";

import { useEffect, useRef } from "react";

type CursorMode = "free" | "button" | "text";

const BASE = {
  free: { width: 16, height: 16, radius: 8 },
  button: { width: 64, height: 64, radius: 32 },
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

    let lastPointerX = targetX;
    let lastPointerY = targetY;
    let lastPointerAt = performance.now();
    let velocityX = 0;
    let velocityY = 0;

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
        el.style.opacity = "1";
      }

      targetX = e.clientX;
      targetY = e.clientY;

      const now = performance.now();
      const dt = Math.max(8, now - lastPointerAt);
      velocityX = ((e.clientX - lastPointerX) / dt) * 16.667;
      velocityY = ((e.clientY - lastPointerY) / dt) * 16.667;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerAt = now;

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
        velocityX = 0;
        velocityY = 0;
      } else {
        const factor = 1 - Math.pow(0.72, dt / 16.667);
        x += (targetX - x) * factor;
        y += (targetY - y) * factor;

        const decay = Math.pow(0.9, dt / 16.667);
        velocityX *= decay;
        velocityY *= decay;
      }

      const base = BASE[mode];
      let targetWidth: number = base.width;
      let targetHeight: number = base.height;
      const targetRadius: number = base.radius;

      if (mode === "free" && !reduceMotion) {
        const speed = Math.min(280, Math.hypot(velocityX, velocityY));
        const stretch = Math.min(1.12, speed / 72);
        const ratioX =
          Math.abs(velocityX) / (Math.abs(velocityX) + Math.abs(velocityY) + 0.001);
        const ratioY = 1 - ratioX;
        targetWidth = base.width * (1 + stretch * 1.18 * ratioX - stretch * 0.78 * ratioY);
        targetHeight = base.height * (1 + stretch * 1.18 * ratioY - stretch * 0.78 * ratioX);
      }

      if (reduceMotion) {
        width = targetWidth;
        height = targetHeight;
        radius = targetRadius;
      } else {
        const dtSec = Math.min(0.032, dt / 1000);
        [width, widthVel] = stepSpring(width, widthVel, targetWidth, dtSec);
        [height, heightVel] = stepSpring(height, heightVel, targetHeight, dtSec);
        [radius, radiusVel] = stepSpring(radius, radiusVel, targetRadius, dtSec);
      }

      el.style.transform = `translate3d(${(x - width / 2).toFixed(2)}px, ${(y - height / 2).toFixed(2)}px, 0)`;
      el.style.width = `${width.toFixed(2)}px`;
      el.style.height = `${height.toFixed(2)}px`;
      el.style.borderRadius = `${radius.toFixed(2)}px`;

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

  return (
    <div
      ref={elRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-999 bg-white mix-blend-difference will-change-transform"
      style={{ opacity: 0 }}
    />
  );
}

export { CustomCursor };
