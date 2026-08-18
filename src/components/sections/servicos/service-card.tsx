"use client";

import { useEffect, useRef } from "react";
import { Info, Layers, LoaderCircle, Minus, PlusCircle, Search } from "lucide-react";

import { gsap, SplitText } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { ServiceIcon, ServiceStepData } from "@/data/servicos";

const ICONS: Record<ServiceIcon, typeof Info> = {
  info: Info,
  search: Search,
  layers: Layers,
  loader: LoaderCircle,
};

// Collapsed card body — light blue deepening step by step, mirroring the ref.
const COLLAPSED_BG = [
  "bg-[#DAF0FF]",
  "bg-[#C1EAFF]",
  "bg-[#A5E1FF]",
  "bg-[#81D5FF]",
];
// Same 4 colors as raw hex, for the fill overlay (which paints via inline
// style/GSAP, not Tailwind classes, since it swaps color per interaction).
const COLLAPSED_HEX = ["#DAF0FF", "#C1EAFF", "#A5E1FF", "#81D5FF"];
const EXPANDED_HEX = "#EDE9E2"; // bg-cream-light

const REVEAL_EASE = "power2.out";
const REVEAL_BLUR = "blur(7px)";
// Applied via .timeScale() rather than baked into each duration — speeds up
// the fill tween and both reveal timelines uniformly, staggers included.
const SPEED = 1.15;

type ServiceCardProps = {
  data: ServiceStepData;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
};

// Collapsed and expanded content both stay mounted and cross-fade by opacity
// while GSAP Flip morphs the surrounding box (see servicos-section); the
// visible one is `relative` and drives the card's height, the hidden one an
// absolute overlay.
//
// Opening and closing run the same 3-stage sequence, mirrored: (1) a circle,
// grown from the clicked icon's position, floods the card with the color the
// new state will have — this masks the content swap, then locks to a
// full-bleed fill (clipPath: none) so it stays covered as Flip resizes the
// card (a fixed-px circle wouldn't scale with the box). (2) the real toggle
// fires and Flip resizes the card. (3) once Flip lands (the
// "servicos:expanded"/"servicos:collapsed" events from servicos-section), the
// new view's text reveals line by line and the fill drops.
function ServiceCard({ data, index, isOpen, onToggle }: ServiceCardProps) {
  const Icon = ICONS[data.icon];

  const cardElRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const fillAnimatingRef = useRef(false);

  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const receivesHeadingRef = useRef<HTMLHeadingElement>(null);
  const howHeadingRef = useRef<HTMLHeadingElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const collapsedHeaderRef = useRef<HTMLDivElement>(null);
  const collapsedSummaryRef = useRef<HTMLParagraphElement>(null);
  const collapsedBtnRef = useRef<HTMLButtonElement>(null);

  const summarySplitRef = useRef<ReturnType<typeof SplitText.create> | null>(null);
  const collapsedSummarySplitRef = useRef<ReturnType<typeof SplitText.create> | null>(null);
  const expandRevealTlRef = useRef<gsap.core.Timeline | null>(null);
  const collapseRevealTlRef = useRef<gsap.core.Timeline | null>(null);

  // Everything each reveal timeline touches directly (not the split lines —
  // those live and die with their own SplitText instance). Killing a tween
  // mid-flight leaves it at a partial value; resetting these before the next
  // .from() prevents it from capturing that leftover value as its target.
  const getExpandRevealTargets = () => {
    const items = cardElRef.current
      ? Array.from(
          cardElRef.current.querySelectorAll<HTMLElement>(
            ".service-receives-item, .service-how-item"
          )
        )
      : [];
    return [
      badgeRef.current,
      titleRef.current,
      receivesHeadingRef.current,
      howHeadingRef.current,
      closeBtnRef.current,
      ...items,
    ].filter((el): el is HTMLElement => el !== null);
  };
  const getCollapseRevealTargets = () =>
    [collapsedHeaderRef.current, collapsedBtnRef.current].filter(
      (el): el is HTMLDivElement | HTMLButtonElement => el !== null
    );

  const runFill = (
    e: React.MouseEvent<HTMLButtonElement>,
    color: string,
    fallback: () => void
  ) => {
    if (fillAnimatingRef.current) return false;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const card = cardElRef.current;
    const fill = fillRef.current;
    if (reduce || !card || !fill) {
      fallback();
      return false;
    }

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Farthest corner from the click point, so the circle fully covers the
    // card regardless of where on the button it was actually clicked.
    const radius = Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y)
    );

    fillAnimatingRef.current = true;
    gsap.set(fill, {
      opacity: 1,
      backgroundColor: color,
      clipPath: `circle(0px at ${x}px ${y}px)`,
    });
    gsap
      .to(fill, {
        clipPath: `circle(${radius}px at ${x}px ${y}px)`,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          // Locks to a full-bleed fill — see the file-level comment above.
          gsap.set(fill, { clipPath: "none" });
          fillAnimatingRef.current = false;
          fallback();
        },
      })
      .timeScale(SPEED);
    return true;
  };

  const handleExpandClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    runFill(e, EXPANDED_HEX, onToggle);
  };

  const handleCollapseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    runFill(e, COLLAPSED_HEX[index], onToggle);
  };

  // Text reveal only runs once Flip has actually finished resizing this card
  // (see servicos-section's Flip.from onComplete) — starting any earlier
  // would animate text into a box that's still changing size underneath it.
  useEffect(() => {
    const handleExpanded = (e: Event) => {
      const detail = (e as CustomEvent<{ index: number }>).detail;
      if (detail?.index !== index) return;

      if (fillRef.current) gsap.set(fillRef.current, { opacity: 0 });

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      expandRevealTlRef.current?.kill();
      summarySplitRef.current?.revert();
      gsap.set(getExpandRevealTargets(), { clearProps: "opacity,filter,transform" });

      // Split now, not on mount: while collapsed this content is width:auto
      // inside the still-narrow card, so measuring line-wrap any earlier
      // would split for the wrong width.
      const split = summaryRef.current
        ? SplitText.create(summaryRef.current, {
            type: "lines",
            linesClass: "service-summary-line",
          })
        : null;
      summarySplitRef.current = split;

      const receivesItems =
        cardElRef.current?.querySelectorAll<HTMLElement>(".service-receives-item") ?? [];
      const howItems =
        cardElRef.current?.querySelectorAll<HTMLElement>(".service-how-item") ?? [];

      const tl = gsap.timeline({ defaults: { ease: REVEAL_EASE } });
      tl.timeScale(SPEED);
      expandRevealTlRef.current = tl;

      if (badgeRef.current) {
        tl.from(badgeRef.current, { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.3 });
      }
      if (titleRef.current) {
        tl.from(
          titleRef.current,
          { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.32 },
          "-=0.18"
        );
      }
      if (split?.lines.length) {
        tl.from(
          split.lines,
          { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.3, stagger: 0.045 },
          "-=0.16"
        );
      }
      if (receivesHeadingRef.current) {
        tl.from(
          receivesHeadingRef.current,
          { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.28 },
          "-=0.1"
        );
      }
      if (howHeadingRef.current) {
        tl.from(howHeadingRef.current, { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.28 }, "<");
      }
      if (receivesItems.length) {
        tl.from(
          receivesItems,
          { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.28, stagger: 0.04 },
          "-=0.12"
        );
      }
      if (howItems.length) {
        tl.from(
          howItems,
          { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.28, stagger: 0.04 },
          "<"
        );
      }
      if (closeBtnRef.current) {
        tl.from(closeBtnRef.current, { opacity: 0, scale: 0.85, duration: 0.25 }, "-=0.1");
      }
    };

    window.addEventListener("servicos:expanded", handleExpanded);
    return () => window.removeEventListener("servicos:expanded", handleExpanded);
  }, [index]);

  // Mirror of the above for the return trip: once Flip has finished shrinking
  // the card back down, the collapsed view's own content reveals the same way.
  useEffect(() => {
    const handleCollapsed = (e: Event) => {
      const detail = (e as CustomEvent<{ index: number }>).detail;
      if (detail?.index !== index) return;

      if (fillRef.current) gsap.set(fillRef.current, { opacity: 0 });

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      collapseRevealTlRef.current?.kill();
      collapsedSummarySplitRef.current?.revert();
      gsap.set(getCollapseRevealTargets(), { clearProps: "opacity,filter,transform" });

      const split = collapsedSummaryRef.current
        ? SplitText.create(collapsedSummaryRef.current, {
            type: "lines",
            linesClass: "service-collapsed-summary-line",
          })
        : null;
      collapsedSummarySplitRef.current = split;

      const tl = gsap.timeline({ defaults: { ease: REVEAL_EASE } });
      tl.timeScale(SPEED);
      collapseRevealTlRef.current = tl;

      if (collapsedHeaderRef.current) {
        tl.from(collapsedHeaderRef.current, { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.3 });
      }
      if (split?.lines.length) {
        tl.from(
          split.lines,
          { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.28, stagger: 0.04 },
          "-=0.16"
        );
      }
      if (collapsedBtnRef.current) {
        tl.from(
          collapsedBtnRef.current,
          { opacity: 0, filter: REVEAL_BLUR, x: 24, duration: 0.26 },
          "-=0.12"
        );
      }
    };

    window.addEventListener("servicos:collapsed", handleCollapsed);
    return () => window.removeEventListener("servicos:collapsed", handleCollapsed);
  }, [index]);

  // Whichever direction isn't the active one gets its reveal state reset —
  // covers any interruption (e.g. closing again mid-open-reveal) so the next
  // run always starts clean rather than fighting a half-finished tween.
  useEffect(() => {
    if (isOpen) {
      collapseRevealTlRef.current?.kill();
      collapsedSummarySplitRef.current?.revert();
      collapsedSummarySplitRef.current = null;
      gsap.set(getCollapseRevealTargets(), { clearProps: "opacity,filter,transform" });
    } else {
      expandRevealTlRef.current?.kill();
      summarySplitRef.current?.revert();
      summarySplitRef.current = null;
      gsap.set(getExpandRevealTargets(), { clearProps: "opacity,filter,transform" });
    }
  }, [isOpen]);

  return (
    <div ref={cardElRef} className="service-card relative overflow-hidden rounded-[24px]">
      {/* Collapsed */}
      <div
        inert={isOpen}
        className={cn(
          "inset-0 transition-opacity duration-[450ms] ease-out",
          isOpen ? "pointer-events-none absolute opacity-0" : "relative opacity-100"
        )}
      >
        <div className="flex h-full w-full">
          <div className="flex w-11 shrink-0 items-center justify-center bg-[#FFF3DC]">
            <span
              className="font-sans text-sm tracking-wide text-navy/75"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {data.tab}
            </span>
          </div>

          <div className={cn("flex min-h-[230px] flex-1 flex-col p-7", COLLAPSED_BG[index])}>
            <div ref={collapsedHeaderRef} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-navy" strokeWidth={1.75} />
              <h3 className="font-sans text-[22px] leading-tight font-medium text-navy">
                {data.title}
              </h3>
            </div>

            <div className="mt-auto">
              <p
                ref={collapsedSummaryRef}
                className="max-w-[19rem] font-sans text-[15px] leading-relaxed text-navy/80"
              >
                {data.summary}
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  ref={collapsedBtnRef}
                  type="button"
                  onClick={handleExpandClick}
                  aria-expanded={isOpen}
                  aria-label="Abrir degrau"
                  className="group/sm inline-flex items-center gap-1.5 font-sans text-sm text-navy/70 transition-colors hover:text-navy"
                >
                  saber mais
                  <PlusCircle
                    className="size-4 transition-transform group-hover/sm:scale-110"
                    strokeWidth={1.75}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded */}
      <div
        inert={!isOpen}
        className={cn(
          "inset-0 transition-opacity duration-[450ms] ease-out",
          isOpen ? "relative opacity-100" : "pointer-events-none absolute opacity-0"
        )}
      >
        <div className="relative h-full bg-cream-light p-8 lg:p-10">
          <span ref={badgeRef} className="inline-block font-sans text-sm text-navy/70">
            {data.badge}
          </span>
          <h3
            ref={titleRef}
            className="mt-2 font-sans text-[26px] leading-tight font-semibold text-navy"
          >
            {data.title}
          </h3>
          <p ref={summaryRef} className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-navy/80">
            {data.summary}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
            <div>
              <h4 ref={receivesHeadingRef} className="font-sans text-lg font-medium text-navy">
                O que recebe
              </h4>
              <ul className="mt-4 flex flex-col">
                {data.receives.map((item) => (
                  <li
                    key={item}
                    className="service-receives-item flex items-start gap-2.5 border-b border-navy/10 py-2.5 font-sans text-sm text-navy/80"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-plum" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 ref={howHeadingRef} className="font-sans text-lg font-medium text-navy">
                Como funciona
              </h4>
              <ul className="mt-4 flex flex-col">
                {data.howItWorks.map((step, i) => (
                  <li
                    key={step.number}
                    className={cn(
                      "service-how-item flex gap-3 py-3",
                      i > 0 && "border-t border-navy/10"
                    )}
                  >
                    <span className="font-heading pt-0.5 text-base text-navy/40">
                      {step.number}.
                    </span>
                    <p className="font-sans text-sm leading-relaxed text-navy/70">
                      <span className="font-medium text-navy">{step.title}</span> —{" "}
                      {step.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleCollapseClick}
            aria-expanded={isOpen}
            aria-label="Fechar degrau"
            className="absolute right-8 bottom-8 inline-flex size-9 items-center justify-center rounded-full bg-white/70 text-navy transition-transform duration-300 hover:scale-105"
          >
            <Minus className="size-4" />
          </button>
        </div>
      </div>

      {/* Fill reveal: grown from the click point of whichever icon (expand or
          collapse) was pressed, painted in the color the card is about to
          become — masks the collapsed/expanded content swap above. */}
      <div
        ref={fillRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-0"
        style={{ clipPath: "circle(0px at 0px 0px)" }}
      />
    </div>
  );
}

export { ServiceCard };
