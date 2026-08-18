"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, Flip, SplitText } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { ButtonLink } from "@/components/ui/button";
import { serviceSteps } from "@/data/servicos";
import { ServiceCard } from "@/components/sections/servicos/service-card";
import { ServicosStaircase } from "@/components/sections/servicos/servicos-staircase";
import { ArrowUpRight } from "@/components/shared/icons";

type Connector = { d: string; head: string };

// Same 15% speedup as the card open/close interaction (see service-card.tsx)
// applied to the card resize morph specifically.
const INTERACTION_SPEED = 1.15;

function buildArrowHead(ex: number, ey: number, c2x: number, c2y: number) {
  let tx = ex - c2x;
  let ty = ey - c2y;
  const len = Math.hypot(tx, ty) || 1;
  tx /= len;
  ty /= len;
  const back = 10;
  const half = 5;
  const bx = ex - tx * back;
  const by = ey - ty * back;
  const px = -ty;
  const py = tx;
  return `M ${ex} ${ey} L ${bx + px * half} ${by + py * half} L ${bx - px * half} ${by - py * half} Z`;
}

function ServicosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const morphAnimRef = useRef<ReturnType<typeof Flip.from> | null>(null);
  const morphingRef = useRef(false);
  const lastActionRef = useRef<{ type: "open" | "close"; index: number } | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  // Flips false -> true once, the first time `measure` ever runs, and never
  // back — used only to gate the entrance timeline below (see its comment).
  const [hasMeasuredOnce, setHasMeasuredOnce] = useState(false);

  const measure = useCallback(() => {
    setHasMeasuredOnce(true);
    // Arrows only bridge the zigzag while every card is collapsed; once one
    // expands to full width the staircase is broken, so drop them. Also stay
    // clear mid-morph so they don't snap to their final spots early.
    if (openIndex !== null || morphingRef.current) {
      setConnectors([]);
      return;
    }
    const next: Connector[] = [];
    for (let i = 0; i < serviceSteps.length - 1; i++) {
      const upper = cardRefs.current[i];
      const lower = cardRefs.current[i + 1];
      if (!upper || !lower) continue;

      const upperIsLeft = i % 2 === 0;
      const dir = upperIsLeft ? 1 : -1;
      const sx = upperIsLeft ? upper.offsetLeft + upper.offsetWidth : upper.offsetLeft;
      const sy = upper.offsetTop + upper.offsetHeight;
      const ex = upperIsLeft ? lower.offsetLeft : lower.offsetLeft + lower.offsetWidth;
      const ey = lower.offsetTop;
      const span = Math.abs(ex - sx);

      const c1x = sx + dir * span * 0.45;
      const c1y = sy + 6;
      const c2x = ex - dir * span * 0.1;
      const c2y = ey - 30;

      next.push({
        d: `M ${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`,
        head: buildArrowHead(ex, ey, c2x, c2y),
      });
    }
    setConnectors(next);
  }, [openIndex]);

  useEffect(() => {
    // Deferred a frame so the initial state update lands outside the effect
    // body; arrows fade in via GSAP, so the one-frame delay is invisible.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = sectionRef.current;

        const eyebrowTextEl = root?.querySelector<HTMLElement>(".servicos-eyebrow-text") ?? null;
        const eyebrowSplit = eyebrowTextEl
          ? SplitText.create(eyebrowTextEl, {
              type: "words",
              mask: "words",
              wordsClass: "servicos-eyebrow-word",
            })
          : null;

        const titleEl = root?.querySelector<HTMLElement>(".servicos-title") ?? null;
        const titleSplit = titleEl
          ? SplitText.create(titleEl, {
              type: "lines",
              mask: "lines",
              linesClass: "servicos-title-line",
            })
          : null;

        const paraEl = root?.querySelector<HTMLElement>(".servicos-paragraph") ?? null;
        const paraSplit = paraEl
          ? SplitText.create(paraEl, {
              type: "lines",
              mask: "lines",
              linesClass: "servicos-paragraph-line",
            })
          : null;

        const ctaTextEl = root?.querySelector<HTMLElement>(".servicos-cta-text") ?? null;
        const ctaSplit = ctaTextEl
          ? SplitText.create(ctaTextEl, { type: "words", wordsClass: "servicos-cta-word" })
          : null;

        const bars = gsap.utils.toArray<HTMLElement>(".staircase-bar");
        const labels = gsap.utils.toArray<HTMLElement>(".staircase-label");
        const numbers = gsap.utils.toArray<HTMLElement>(".staircase-number");
        const cards = gsap.utils.toArray<HTMLElement>(".service-card");
        // Populated only once hasMeasuredOnce is true — see the dependency
        // note below.
        const connectorLines = gsap.utils.toArray<SVGPathElement>(".connector-line");
        const connectorHeads = gsap.utils.toArray<SVGPathElement>(".connector-head");

        // Every hidden "from" state set up front, not left to each .to()'s
        // own scheduling — nothing should flash at full size/opacity before
        // the ScrollTrigger actually fires.
        gsap.set(".servicos-eyebrow", { scaleX: 0 });
        gsap.set(eyebrowSplit?.words ?? [], { y: 16, opacity: 0 });
        gsap.set(titleSplit?.lines ?? [], { x: -24, y: -20, opacity: 0 });
        gsap.set(paraSplit?.lines ?? [], { x: -20, y: -16, opacity: 0 });
        gsap.set(bars, { scaleY: 0 });
        gsap.set([...labels, ...numbers], { y: 14, opacity: 0 });
        gsap.set(cards, { x: (i: number) => (i % 2 === 0 ? -60 : 60), scale: 0.92, opacity: 0 });
        gsap.set(connectorLines, { drawSVG: "0%" });
        gsap.set(connectorHeads, { opacity: 0, scale: 0.4, transformOrigin: "center" });
        gsap.set(ctaSplit?.words ?? [], { opacity: 0, filter: "blur(8px)" });
        gsap.set(".servicos-cta-button", { y: 24, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        });

        // 1. Eyebrow pill: the shape grows left -> right, then its words
        // slide down into place inside it.
        tl.to(".servicos-eyebrow", { scaleX: 1, duration: 0.32, ease: "power2.out" }).to(
          eyebrowSplit?.words ?? [],
          { y: 0, opacity: 1, duration: 0.32, stagger: 0.04, ease: "power2.out" },
          "-=0.06"
        );

        // 2. Heading: lines stagger in from a little above and to the left.
        tl.to(
          titleSplit?.lines ?? [],
          { x: 0, y: 0, opacity: 1, duration: 0.65, stagger: 0.12, ease: "power3.out" },
          "-=0.05"
        );

        // 3. Subheading: same diagonal cascade, lighter offset/duration.
        tl.to(
          paraSplit?.lines ?? [],
          { x: 0, y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" },
          "-=0.35"
        );

        // 4. Staircase: its own nested timeline, added at position 0 so it
        // starts alongside the pill rather than waiting for the text column
        // — keeping it separate means its internal "-=X" offsets don't
        // fight the ones above. Each bar grows bottom-up, and the instant
        // it lands, its own label + number slide up.
        const staircaseTl = gsap.timeline();
        bars.forEach((bar, i) => {
          staircaseTl.to(
            bar,
            { scaleY: 1, duration: 0.3, ease: "power2.out" },
            i === 0 ? 0 : "-=0.14"
          );
          staircaseTl.to(
            [labels[i], numbers[i]],
            { y: 0, opacity: 1, duration: 0.2, stagger: 0.04, ease: "power2.out" },
            "-=0.08"
          );
        });
        tl.add(staircaseTl, 0);

        // 5. CTA: phrase blurs in word by word, then the button slides up.
        // Timed off tl.duration() so far — whichever of the text column or
        // the staircase track actually finishes last — not a fixed offset
        // from either one specifically.
        const introDone = tl.duration();
        tl.to(
          ctaSplit?.words ?? [],
          { opacity: 1, filter: "blur(0px)", duration: 0.35, stagger: 0.05, ease: "power2.out" },
          introDone - 0.1
        ).to(".servicos-cta-button", { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.15");

        // Cards + connectors: scroll-scrubbed, not autoplayed. Each card,
        // and its dashed connector line, tracks scroll position directly
        // across the stage's height — scrolling back up un-reveals them.
        const cardsTl = gsap.timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top 85%",
            end: "bottom 65%",
            scrub: 0.4,
          },
        });
        cards.forEach((card, i) => {
          cardsTl.to(
            card,
            { x: 0, scale: 1, opacity: 1, duration: 0.5, ease: "none" },
            i === 0 ? 0 : "-=0.15"
          );
          const line = connectorLines[i];
          const head = connectorHeads[i];
          if (line) {
            cardsTl.to(line, { drawSVG: "100%", duration: 0.3, ease: "none" }, "-=0.2");
          }
          if (head) {
            cardsTl.to(head, { opacity: 1, scale: 1, duration: 0.15, ease: "none" }, "-=0.05");
          }
        });

        return () => {
          tl.kill();
          cardsTl.kill();
          eyebrowSplit?.revert();
          titleSplit?.revert();
          paraSplit?.revert();
          ctaSplit?.revert();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".servicos-eyebrow",
            ".servicos-eyebrow-text",
            ".servicos-title",
            ".servicos-paragraph",
            ".staircase-bar",
            ".staircase-label",
            ".staircase-number",
            ".service-card",
            ".connector-line",
            ".connector-head",
            ".servicos-cta-text",
            ".servicos-cta-button",
          ],
          { clearProps: "all" }
        );
      });

      return () => mm.revert();
    },
    // Re-runs once `hasMeasuredOnce` flips to true, rebuilding this whole
    // setup after the connector <path> elements actually exist in the DOM.
    { scope: sectionRef, dependencies: [hasMeasuredOnce] }
  );

  // Morph flow: snapshot every card box, flip the open state, then let the
  // layout effect below animate the recorded boxes to their new size/place.
  const handleToggle = (index: number) => {
    const boxes = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
    flipStateRef.current = Flip.getState(boxes);
    morphingRef.current = true;
    setConnectors([]);
    setOpenIndex((current) => {
      lastActionRef.current = current === index ? { type: "close", index } : { type: "open", index };
      return current === index ? null : index;
    });
  };

  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (!state) return;
    flipStateRef.current = null;

    const stage = stageRef.current;
    const action = lastActionRef.current;
    const finish = () => {
      morphingRef.current = false;
      if (stage) stage.style.height = "";
      measure();
      // ServiceCard listens for these to know the resize is truly done
      // before animating its new view's text in — a matching event either
      // way, since both opening and closing get their own text reveal now.
      if (action) {
        window.dispatchEvent(
          new CustomEvent(action.type === "open" ? "servicos:expanded" : "servicos:collapsed", {
            detail: { index: action.index },
          })
        );
      }
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !stage) {
      finish();
      return;
    }

    // Kill any in-flight morph here rather than in a cleanup: React Strict
    // Mode double-invokes effects in dev, and a cleanup-based kill would tear
    // this animation down the instant it starts.
    morphAnimRef.current?.kill();

    // Pin the stage to its committed height so the momentarily-absolute cards
    // don't collapse it (and shove the rest of the page) during the morph.
    stage.style.height = "";
    stage.style.height = `${stage.offsetHeight}px`;

    morphAnimRef.current = Flip.from(state, {
      absolute: true,
      duration: 0.5,
      ease: "sine.inOut",
      onComplete: finish,
    }).timeScale(INTERACTION_SPEED);
  }, [openIndex, measure]);

  return (
    <section
      id="servicos"
      ref={sectionRef}
      className="flex min-h-screen flex-col justify-center bg-cream py-28 lg:pt-40 lg:pb-22.5"
    >
      <SectionContainer>
        <div className="grid grid-cols-1 items-start gap-y-12 lg:grid-cols-[460fr_620fr] lg:gap-x-12">
          <div>
            <span className="servicos-eyebrow origin-left inline-block overflow-hidden rounded-full bg-lavender px-4 py-1.5">
              <span className="servicos-eyebrow-text inline-block font-sans text-sm text-navy">
                O que fazemos
              </span>
            </span>
            <SectionTitle className="servicos-title mt-5 leading-13">
              Do zero ao fim.
              <br />
              Uma escada de valor.
            </SectionTitle>
            <p className="servicos-paragraph mt-6 max-w-sm font-sans text-base leading-relaxed text-navy/70">
              Cada produto é completo em si mesmo — e prepara o terreno para o
              seguinte. Da sessão de clareza à orquestração recorrente.
            </p>
          </div>

          <div className="servicos-staircase hidden lg:block">
            <ServicosStaircase />
          </div>
        </div>

        <div ref={stageRef} className="relative isolate mt-20 flex flex-col gap-y-6 lg:mt-28 lg:gap-y-10">
          <svg className="servicos-connectors pointer-events-none absolute inset-0 -z-10 hidden h-full w-full overflow-visible lg:block">
            {connectors.map((connector, index) => (
              <g key={index}>
                <path
                  d={connector.d}
                  className="connector-line"
                  fill="none"
                  stroke="#001F35"
                  strokeOpacity={0.45}
                  strokeWidth={1.5}
                  strokeDasharray="6 7"
                  strokeLinecap="round"
                />
                <path d={connector.head} className="connector-head" fill="#001F35" fillOpacity={0.75} />
              </g>
            ))}
          </svg>

          {serviceSteps.map((step, index) => (
            <div
              key={step.number}
              className={index % 2 === 0 ? "flex justify-start" : "flex justify-end"}
            >
              <div
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={cn(
                  "overflow-hidden rounded-[24px]",
                  openIndex === index ? "w-full" : "w-full lg:w-[37%]"
                )}
              >
                <ServiceCard
                  data={step}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="servicos-cta mt-20 lg:mt-24">
          <p className="servicos-cta-text font-sans text-2xl font-semibold text-navy">
            Pronto para o primeiro passo?
          </p>
          <ButtonLink
            href="#contato"
            variant="pillOutline"
            size="pill"
            className="servicos-cta-button mt-4 border-navy bg-lavender text-navy hover:bg-lavender/80"
          >
            Diagnóstico <ArrowUpRight className="size-3" />
          </ButtonLink>
        </div>
      </SectionContainer>
    </section>
  );
}

export { ServicosSection };
