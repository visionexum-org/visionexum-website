import { ScrollTrigger } from "@/lib/gsap";

const LERP_BASE = 0.72;
const WHEEL_MULTIPLIER = 0.9;
const TOUCH_MULTIPLIER = 1.5;
const KEY_STEP = 90;
const SETTLE_EPSILON = 0.05;

// Flick momentum. Touch input alone ends travel at the moment of release; the
// decay below continues it. Decay is expressed per 16.67ms and rescaled by the
// measured frame time so glide length is independent of refresh rate.
const MOMENTUM_DECAY = 0.94;
const MOMENTUM_MIN = 0.12;
const MOMENTUM_MAX = 90;

type State = {
  current: number;
  target: number;
  maxScroll: number;
  trackEl: HTMLElement | null;
  rafId: number;
  running: boolean;
  reduceMotion: boolean;
  lastTimestamp: number;
  lastTouchY: number;
  lastTouchAt: number;
  touchVelocity: number;
  momentum: number;
};

const state: State = {
  current: 0,
  target: 0,
  maxScroll: 0,
  trackEl: null,
  rafId: 0,
  running: false,
  reduceMotion: false,
  lastTimestamp: 0,
  lastTouchY: 0,
  lastTouchAt: 0,
  touchVelocity: 0,
  momentum: 0,
};

// Set while a full-screen overlay owns the viewport. Input handlers are bound
// to window and would otherwise continue to scroll the page beneath it.
let scrollLocked = false;

function setScrollLocked(locked: boolean) {
  scrollLocked = locked;
  if (locked) {
    state.momentum = 0;
    state.touchVelocity = 0;
  }
}

function clamp(value: number) {
  return Math.min(state.maxScroll, Math.max(0, value));
}

function applyTransform() {
  if (state.trackEl) {
    state.trackEl.style.transform = `translate3d(0, ${(-state.current).toFixed(2)}px, 0)`;
  }
  applyParallax();
}

function applyParallax() {
  if (!state.trackEl) return;
  const layers = state.trackEl.querySelectorAll<HTMLElement>("[data-speed]");
  layers.forEach((layer) => {
    const speed = parseFloat(layer.dataset.speed ?? "1");
    const offset = state.current * (speed - 1);
    layer.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  });
}

function recalcMax() {
  if (!state.trackEl) return;
  state.maxScroll = Math.max(0, state.trackEl.scrollHeight - window.innerHeight);
  state.target = clamp(state.target);
  state.current = clamp(state.current);
  applyTransform();
}

let scrollerProxyConfigured = false;
function ensureScrollerProxy() {
  if (scrollerProxyConfigured) return;
  scrollerProxyConfigured = true;

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value?: number) {
      if (typeof value === "number") {
        state.current = value;
        state.target = value;
        applyTransform();
      }
      return state.current;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: "transform",
  });
}

if (typeof window !== "undefined") {
  ensureScrollerProxy();
}

function isEditableTarget(el: Element | null) {
  if (!el) return false;
  return !!el.closest("input, textarea, select, [contenteditable='true']");
}

function easeOutExpo(progress: number) {
  return progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
}

// Each call claims a generation; a superseded step() exits on its next frame.
// Concurrent snaps would otherwise apply competing deltas to state.target.
let snapGeneration = 0;

// Snaps requested through navigation take precedence over the automatic
// hand-offs between sections. Travel spanning several sections crosses their
// triggers, so hand-offs are suppressed until the requested snap completes.
let userSnapEndsAt = 0;

type SnapOptions = { user?: boolean };

function snapTo(
  destination: number | (() => number),
  duration = 900,
  onComplete?: () => void,
  options: SnapOptions = {}
) {
  if (!options.user && performance.now() < userSnapEndsAt) return;
  if (options.user) userSnapEndsAt = performance.now() + duration + 120;

  const myGeneration = ++snapGeneration;
  // Re-read per frame: section heights change under scrub, so a destination
  // measured once at call time drifts over the course of the travel.
  const readDestination = () =>
    clamp(typeof destination === "function" ? destination() : destination);

  if (state.reduceMotion) {
    state.target = readDestination();
    onComplete?.();
    return;
  }

  const start = performance.now();
  const from = state.target;
  let applied = 0;

  startLoop();

  function step(now: number) {
    if (myGeneration !== snapGeneration) return;
    const progress = Math.min(1, (now - start) / duration);
    const eased = easeOutExpo(progress);
    // Applied as a delta so concurrent wheel input is preserved rather than
    // overwritten on each frame.
    const value = (readDestination() - from) * eased;
    state.target = clamp(state.target + (value - applied));
    applied = value;
    // Re-arm each frame. tick() halts once target and current agree, which is
    // still true on the first frame of a snap because tick is queued ahead of
    // this step. Without re-arming, the loop would not resume to follow the
    // advancing target.
    startLoop();
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(step);
}

function scrollToElement(
  el: HTMLElement,
  duration?: number,
  onComplete?: () => void,
  options?: SnapOptions
) {
  snapTo(() => el.getBoundingClientRect().top + state.current, duration, onComplete, options);
}

function tick(timestamp: number) {
  const dt = timestamp - state.lastTimestamp;
  state.lastTimestamp = timestamp;

  if (state.momentum !== 0) {
    const before = state.target;
    state.target = clamp(state.target + state.momentum * (dt / 16.667));
    state.momentum *= Math.pow(MOMENTUM_DECAY, dt / 16.667);
    // Exhausted, or clamped at either end of the document.
    if (Math.abs(state.momentum) < MOMENTUM_MIN || state.target === before) {
      state.momentum = 0;
    }
  }

  if (state.reduceMotion) {
    state.current = state.target;
  } else {
    const factor = 1 - Math.pow(LERP_BASE, dt / 16.667);
    state.current += (state.target - state.current) * factor;
  }

  const settled =
    state.momentum === 0 && Math.abs(state.target - state.current) < SETTLE_EPSILON;
  if (settled) {
    state.current = state.target;
  }

  applyTransform();
  ScrollTrigger.update();

  window.dispatchEvent(
    new CustomEvent("virtualscroll", {
      detail: { current: state.current, maxScroll: state.maxScroll },
    })
  );

  // Halt at rest rather than looping indefinitely: an event dispatched
  // continuously at a constant position is indistinguishable from upward
  // scrolling to listeners such as the navbar. Resumed on the next input.
  if (state.running && !settled) {
    state.rafId = requestAnimationFrame(tick);
  } else {
    state.running = false;
  }
}

function startLoop() {
  if (state.running) return;
  state.running = true;
  state.lastTimestamp = performance.now();
  state.rafId = requestAnimationFrame(tick);
}

function stopLoop() {
  state.running = false;
  cancelAnimationFrame(state.rafId);
}

function initVirtualScroll(trackEl: HTMLElement) {
  state.trackEl = trackEl;
  ensureScrollerProxy();

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  state.reduceMotion = reduceMotionQuery.matches;
  const onReduceMotionChange = (e: MediaQueryListEvent) => {
    state.reduceMotion = e.matches;
  };
  reduceMotionQuery.addEventListener("change", onReduceMotionChange);

  document.body.classList.add("virtual-scroll-active");

  // Covers a restored offset surviving the declaration above, from a bfcache
  // entry or a browser that ignores it. The track is authoritative, so any
  // native offset is cleared before the first frame.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (window.scrollY !== 0) window.scrollTo(0, 0);

  recalcMax();

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (scrollLocked) return;
    state.target = clamp(state.target + e.deltaY * WHEEL_MULTIPLIER);
    startLoop();
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (scrollLocked) return;
    state.lastTouchY = e.touches[0].clientY;
    state.lastTouchAt = performance.now();
    // Contact during a glide cancels it, matching native behaviour.
    state.momentum = 0;
    state.touchVelocity = 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (scrollLocked) return;
    const y = e.touches[0].clientY;
    const now = performance.now();
    const delta = state.lastTouchY - y;
    const dt = Math.max(1, now - state.lastTouchAt);

    // Smoothed per-frame velocity: an irregular sample immediately before
    // release must not determine the resulting travel distance.
    const sample = (delta / dt) * 16.667;
    state.touchVelocity = state.touchVelocity * 0.7 + sample * 0.3;

    state.lastTouchY = y;
    state.lastTouchAt = now;
    state.target = clamp(state.target + delta * TOUCH_MULTIPLIER);
    startLoop();
  };

  const handleTouchEnd = () => {
    if (scrollLocked) return;
    // Discard velocity from a contact that had already come to rest.
    if (performance.now() - state.lastTouchAt > 100) {
      state.touchVelocity = 0;
      return;
    }
    const launch = state.touchVelocity * TOUCH_MULTIPLIER;
    state.momentum = Math.max(-MOMENTUM_MAX, Math.min(MOMENTUM_MAX, launch));
    state.touchVelocity = 0;
    if (Math.abs(state.momentum) > MOMENTUM_MIN) startLoop();
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (scrollLocked) return;
    if (isEditableTarget(document.activeElement)) return;

    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
        e.preventDefault();
        state.target = clamp(state.target + KEY_STEP);
        break;
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        state.target = clamp(state.target - KEY_STEP);
        break;
      case " ":
        e.preventDefault();
        state.target = clamp(
          state.target + (e.shiftKey ? -window.innerHeight * 0.9 : window.innerHeight * 0.9)
        );
        break;
      case "Home":
        e.preventDefault();
        state.target = 0;
        break;
      case "End":
        e.preventDefault();
        state.target = state.maxScroll;
        break;
      default:
        return;
    }
    startLoop();
  };

  const handleSeek = (e: Event) => {
    const { value } = (e as CustomEvent<{ value: number }>).detail;
    state.target = clamp(value);
    startLoop();
  };

  const handleAnchorClick = (e: MouseEvent) => {
    const anchor = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute("href")?.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    scrollToElement(target, undefined, undefined, { user: true });
  };

  const resizeObserver = new ResizeObserver(() => recalcMax());
  resizeObserver.observe(trackEl);
  window.addEventListener("resize", recalcMax);

  // Supplements the ResizeObserver: late-loading fonts and images can shift
  // layout after the initial measurement. Both paths are idempotent.
  window.addEventListener("load", recalcMax);
  document.fonts?.ready.then(recalcMax);

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  };

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });
  window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
  window.addEventListener("keydown", handleKeydown);
  document.addEventListener("click", handleAnchorClick);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("virtualscroll:seek", handleSeek);

  startLoop();
  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    stopLoop();
    resizeObserver.disconnect();
    window.removeEventListener("resize", recalcMax);
    window.removeEventListener("load", recalcMax);
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
    window.removeEventListener("touchcancel", handleTouchEnd);
    window.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("click", handleAnchorClick);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("virtualscroll:seek", handleSeek);
    reduceMotionQuery.removeEventListener("change", onReduceMotionChange);
    document.body.classList.remove("virtual-scroll-active");
    state.trackEl = null;
  };
}

function getState() {
  return state;
}

export { initVirtualScroll, getState, scrollToElement, setScrollLocked };
