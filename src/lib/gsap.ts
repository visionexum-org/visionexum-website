import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin);

// The virtual scroll track drives scroll position itself (see
// src/lib/virtual-scroll.ts), so every ScrollTrigger sitewide must read
// from that instead of the native window scroller. Set here, at module
// load, so it's in effect before any section's useGSAP creates a trigger —
// component effect order can't guarantee that.
if (typeof window !== "undefined") {
  ScrollTrigger.defaults({ scroller: document.body });
}

export { gsap, ScrollTrigger, SplitText, Flip, DrawSVGPlugin };
