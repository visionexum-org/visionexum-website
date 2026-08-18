"use client";

import { useEffect, useRef } from "react";

import { getState, initVirtualScroll } from "@/lib/virtual-scroll";

function VirtualScrollbar() {
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const thumb = thumbRef.current;
    const track = trackRef.current;
    if (!thumb || !track) return;

    const render = () => {
      const { current, maxScroll } = getState();
      const viewport = window.innerHeight;
      const total = viewport + maxScroll;
      const thumbHeightPct = Math.max(8, (viewport / total) * 100);
      const progress = maxScroll > 0 ? current / maxScroll : 0;
      const topPct = progress * (100 - thumbHeightPct);

      thumb.style.height = `${thumbHeightPct}%`;
      thumb.style.top = `${topPct}%`;
      track.style.opacity = maxScroll > 0 ? "1" : "0";
      track.setAttribute("aria-valuenow", Math.round(progress * 100).toString());
    };

    const handleEvent = () => render();
    window.addEventListener("virtualscroll", handleEvent);
    render();

    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      const { maxScroll } = getState();
      window.dispatchEvent(
        new CustomEvent("virtualscroll:seek", { detail: { value: ratio * maxScroll } })
      );
    };

    const handlePointerUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("virtualscroll", handleEvent);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    const { maxScroll } = getState();
    window.dispatchEvent(
      new CustomEvent("virtualscroll:seek", { detail: { value: ratio * maxScroll } })
    );
  };

  return (
    <div
      ref={trackRef}
      role="scrollbar"
      aria-controls="virtual-scroll-track"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      onPointerDown={handleTrackPointerDown}
      className="fixed top-0 right-0 z-50 h-full w-2.5 cursor-pointer touch-none opacity-0 transition-opacity"
    >
      <div
        ref={thumbRef}
        className="absolute right-0.5 w-1.5 rounded-full bg-navy/25 hover:bg-navy/40"
      />
    </div>
  );
}

function VirtualScroll({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    return initVirtualScroll(track);
  }, []);

  return (
    <>
      <div id="virtual-scroll-track" ref={trackRef}>
        {children}
      </div>
      <VirtualScrollbar />
    </>
  );
}

export { VirtualScroll };
