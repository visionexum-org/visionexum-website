import { ScrollTrigger } from "@/lib/gsap";

const LERP_BASE = 0.72;
const WHEEL_MULTIPLIER = 0.9;
const TOUCH_MULTIPLIER = 1.5;
const KEY_STEP = 90;
const SETTLE_EPSILON = 0.05;

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
};

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

// Each call gets its own generation number; a stale step() bails if a newer
// snapTo has since superseded it. Without this, two overlapping snaps (a
// fast scroll crossing two hand-off triggers within the same few frames)
// would each nudge state.target independently, fighting each other and
// leaving the scroll stuck at neither destination.
let snapGeneration = 0;

function snapTo(destination: number, duration = 900, onComplete?: () => void) {
  const myGeneration = ++snapGeneration;
  const clampedDestination = clamp(destination);

  if (state.reduceMotion) {
    state.target = clampedDestination;
    onComplete?.();
    return;
  }

  const start = performance.now();
  const from = state.target;
  const distance = clampedDestination - from;
  let applied = 0;

  startLoop();

  function step(now: number) {
    if (myGeneration !== snapGeneration) return;
    const progress = Math.min(1, (now - start) / duration);
    const eased = easeOutExpo(progress);
    const value = distance * eased;
    state.target = clamp(state.target + (value - applied));
    applied = value;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(step);
}

function scrollToElement(el: HTMLElement, duration?: number, onComplete?: () => void) {
  const naturalTop = el.getBoundingClientRect().top + state.current;
  snapTo(naturalTop, duration, onComplete);
}

function tick(timestamp: number) {
  const dt = timestamp - state.lastTimestamp;
  state.lastTimestamp = timestamp;

  if (state.reduceMotion) {
    state.current = state.target;
  } else {
    const factor = 1 - Math.pow(LERP_BASE, dt / 16.667);
    state.current += (state.target - state.current) * factor;
  }

  const settled = Math.abs(state.target - state.current) < SETTLE_EPSILON;
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

  // Stop once at rest instead of looping forever — a continuously-firing
  // "scroll" event at a constant position reads as "not scrolling down
  // anymore" to listeners like the navbar, which would reveal itself
  // every time the page sat idle. Resumed by requestTick() on new input.
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
  recalcMax();

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    state.target = clamp(state.target + e.deltaY * WHEEL_MULTIPLIER);
    startLoop();
  };

  const handleTouchStart = (e: TouchEvent) => {
    state.lastTouchY = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const y = e.touches[0].clientY;
    const delta = state.lastTouchY - y;
    state.lastTouchY = y;
    state.target = clamp(state.target + delta * TOUCH_MULTIPLIER);
    startLoop();
  };

  const handleKeydown = (e: KeyboardEvent) => {
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
    scrollToElement(target);
  };

  const resizeObserver = new ResizeObserver(() => recalcMax());
  resizeObserver.observe(trackEl);
  window.addEventListener("resize", recalcMax);

  // Belt-and-suspenders on top of the ResizeObserver: late-loading web
  // fonts and images can shift layout after the initial measurement.
  // Both are cheap and idempotent — safe to fire even if the observer
  // already caught the same change.
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

export { initVirtualScroll, getState, scrollToElement };
