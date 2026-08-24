import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, MorphSVGPlugin);

// Scroll position is driven by the virtual scroll track (see
// src/lib/virtual-scroll.ts), so every ScrollTrigger must read from it rather
// than the native window scroller. Configured at module load so it applies
// before any section creates a trigger; component effect order cannot
// guarantee that ordering.
if (typeof window !== "undefined") {
  ScrollTrigger.defaults({ scroller: document.body });
}

export { gsap, ScrollTrigger, SplitText, Flip, DrawSVGPlugin, MorphSVGPlugin };
