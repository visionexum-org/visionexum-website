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

// Collapsed card body: light blue, deepening by step.
const COLLAPSED_BG = [
  "bg-[#DAF0FF]",
  "bg-[#C1EAFF]",
  "bg-[#A5E1FF]",
  "bg-[#81D5FF]",
];
// The same four colours as raw hex, for the fill overlay. It paints through
// inline style rather than Tailwind classes because the colour changes per
// interaction.
const COLLAPSED_HEX = ["#DAF0FF", "#C1EAFF", "#A5E1FF", "#81D5FF"];
const EXPANDED_HEX = "#EDE9E2"; // bg-cream-light

const REVEAL_EASE = "power2.out";
const REVEAL_BLUR = "blur(7px)";
// Applied through .timeScale() rather than to individual durations, so the
// fill tween and both reveal timelines scale uniformly, staggers included.
const SPEED = 1.15;

type ServiceCardProps = {
  data: ServiceStepData;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
};

// Both the collapsed and expanded bodies remain mounted and cross-fade by
// opacity while GSAP Flip morphs the surrounding box (see servicos-section).
// The visible body is positioned relative and determines the card height; the
// hidden one is an absolute overlay.
//
// Opening and closing share one three-stage sequence, mirrored:
//   1. A circle grown from the activating icon floods the card with the
//      incoming state's colour, masking the content swap, then locks to a
//      full-bleed fill (clipPath: none) so coverage holds while Flip resizes
//      the card. A fixed-pixel circle would not scale with the box.
//   2. The toggle fires and Flip resizes the card.
//   3. On the "servicos:expanded" / "servicos:collapsed" events dispatched
//      once Flip settles, the incoming text reveals line by line and the fill
//      is released.
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

  // Every target each reveal timeline addresses directly. Split lines are
  // excluded: they are owned by their SplitText instance. A tween killed
  // mid-flight leaves a partial value, so these are reset before the next
  // .from() to prevent that value being captured as the new target.
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
    // Distance to the farthest corner, so the circle covers the card from any
    // activation point.
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
          // Locks to a full-bleed fill; see the file-level note above.
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

  // The text reveal runs only after Flip has finished resizing the card (see
  // the Flip.from onComplete in servicos-section). Starting earlier would
  // animate text inside a box whose dimensions are still changing.
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

      // Split at this point rather than on mount: while collapsed, the content
      // is width:auto inside a narrower card, so an earlier measurement would
      // wrap against the wrong width.
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

  // Mirrors the above for the return transition: once Flip has finished
  // contracting the card, the collapsed body reveals by the same sequence.
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

  // The inactive direction has its reveal state reset, so an interruption
  // leaves the next run with a clean starting state rather than a partially
  // completed tween.
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
