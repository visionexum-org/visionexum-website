"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

// The native caret is hidden and redrawn as an element so it can be sprung
// between positions instead of jumping. Everything else about the input stays
// native: real value, real selection, real IME, real form semantics.
const SPRING_STIFFNESS = 500;
const SPRING_DAMPING = 30;
const SPRING_MASS = 0.5;

function SmoothInput({
  className,
  onChange,
  onBlur,
  onFocus,
  caretClassName,
  ...props
}: React.ComponentProps<"input"> & { caretClassName?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    const measure = measureRef.current;
    const caret = caretRef.current;
    const wrapper = wrapperRef.current;
    if (!input || !measure || !caret || !wrapper) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let target = 0;
    let current = 0;
    let velocity = 0;
    let visible = false;
    let rafId = 0;
    let running = false;
    let lastTimestamp = 0;

    const syncMeasureFont = () => {
      const s = window.getComputedStyle(input);
      measure.style.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
      measure.style.letterSpacing = s.letterSpacing;
      measure.style.fontFeatureSettings = s.fontFeatureSettings;
      measure.style.fontVariationSettings = s.fontVariationSettings;
    };

    const caretIndex = () => {
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      if (start === end) return start;
      return input.selectionDirection === "backward" ? start : end;
    };

    const update = () => {
      const s = window.getComputedStyle(input);
      const paddingLeft = parseFloat(s.paddingLeft) || 0;
      const paddingRight = parseFloat(s.paddingRight) || 0;

      const index = caretIndex();
      const before =
        input.type === "password" ? "•".repeat(index) : input.value.slice(0, index);

      syncMeasureFont();
      measure.textContent = before;
      const absolute = before.length > 0 ? measure.offsetWidth + paddingLeft : paddingLeft;

      // Keep the real caret position on screen when the value overflows.
      const maxScroll = Math.max(0, input.scrollWidth - input.clientWidth);
      const visibleRight = input.scrollLeft + input.clientWidth - paddingRight;
      const visibleLeft = input.scrollLeft + paddingLeft;
      if (absolute > visibleRight) {
        input.scrollLeft = Math.min(absolute - input.clientWidth + paddingRight, maxScroll);
      } else if (absolute < visibleLeft) {
        input.scrollLeft = Math.max(0, absolute - paddingLeft);
      }

      const position = absolute - input.scrollLeft;
      const maxX = input.clientWidth - paddingRight;
      const hasSelection = (input.selectionStart ?? 0) !== (input.selectionEnd ?? 0);
      const inRange = position >= paddingLeft - 1 && position <= maxX + 1;

      target = Math.min(position, maxX);
      visible = document.activeElement === input && inRange && !hasSelection;
      caret.style.opacity = visible ? "1" : "0";

      if (reduceMotion) {
        current = target;
        velocity = 0;
        caret.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`;
        return;
      }
      startLoop();
    };

    const tick = (timestamp: number) => {
      const dt = Math.min(0.032, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      const force =
        ((target - current) * SPRING_STIFFNESS - velocity * SPRING_DAMPING) / SPRING_MASS;
      velocity += force * dt;
      current += velocity * dt;

      caret.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`;

      const settled = Math.abs(target - current) < 0.05 && Math.abs(velocity) < 0.5;
      if (settled) {
        current = target;
        caret.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`;
        running = false;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    function startLoop() {
      if (running) return;
      running = true;
      lastTimestamp = performance.now();
      rafId = requestAnimationFrame(tick);
    }

    const onSelectionChange = () => {
      if (document.activeElement !== input) return;
      requestAnimationFrame(() => {
        if (document.activeElement === input) update();
      });
    };
    const onScrollOrResize = () => {
      if (document.activeElement === input) update();
    };

    document.addEventListener("selectionchange", onSelectionChange);
    input.addEventListener("scroll", onScrollOrResize);
    document.fonts?.addEventListener("loadingdone", onScrollOrResize);
    void document.fonts?.ready.then(onScrollOrResize);

    const resizeObserver = new ResizeObserver(onScrollOrResize);
    resizeObserver.observe(wrapper);

    // Jump straight to the caret on focus rather than sliding in from
    // wherever it was left: the arrival should read as placing a caret, not
    // as an object flying across the field.
    const onFocusIn = () => {
      update();
      current = target;
      velocity = 0;
      caret.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`;
    };
    input.addEventListener("focus", onFocusIn);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("selectionchange", onSelectionChange);
      input.removeEventListener("scroll", onScrollOrResize);
      input.removeEventListener("focus", onFocusIn);
      document.fonts?.removeEventListener("loadingdone", onScrollOrResize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative grid grid-cols-1">
      <input
        {...props}
        ref={inputRef}
        className={cn(
          "col-start-1 row-start-1 [caret-color:transparent]",
          className
        )}
        onChange={(e) => {
          onChange?.(e);
          requestAnimationFrame(() => {
            document.dispatchEvent(new Event("selectionchange"));
          });
        }}
        onFocus={onFocus}
        onBlur={(e) => {
          if (caretRef.current) caretRef.current.style.opacity = "0";
          onBlur?.(e);
        }}
      />
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre"
      />
      <div
        ref={caretRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none col-start-1 row-start-1 h-[1.1em] w-0.5 self-center rounded-full bg-navy will-change-transform",
          caretClassName
        )}
        style={{ opacity: 0 }}
      />
    </div>
  );
}

export { SmoothInput };
