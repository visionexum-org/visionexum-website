"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { gsap } from "@/lib/gsap";
import { SectionContainer } from "@/components/shared/section-container";
import { ButtonLink } from "@/components/ui/button";
import { scoreDimensions, scoreZones } from "@/data/visio-score";
import { DimensionCard } from "@/components/sections/visio-score/dimension-card";
import { ScoreZoneCard } from "@/components/sections/visio-score/score-zone-card";

const [zone0, zone1, zone2, zone3] = scoreZones;
const AUTO_ADVANCE_MS = 6000;
// Same premium content width as every other section; the two columns keep the
// design's title:card ≈ 599:793 proportion whatever that width resolves to.
const COLUMN_GRID = "lg:grid-cols-[599fr_793fr]";

function VisioScoreSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = scoreDimensions.length;

  const go = (direction: number) =>
    setActiveIndex((current) => (current + direction + total) % total);

  // Auto-advance the carousel; any change (manual or auto) resets the timer.
  // Held back under reduced-motion so content doesn't move on its own.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [activeIndex, total]);

  // Cross-fade the dimension card whenever the active dimension changes.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    gsap.fromTo(
      card,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
    );
  }, [activeIndex]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const introTl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
        });
        introTl
          .from(".vs-title", {
            y: 32,
            opacity: 0,
            filter: "blur(10px)",
            duration: 0.9,
            ease: "power2.out",
          })
          .from(".vs-paragraph", { y: 24, opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.6")
          .from(".vs-card", { y: 32, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
          .from(".vs-carousel", { y: 16, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4");

        const bottomTl = gsap.timeline({
          scrollTrigger: { trigger: ".vs-bottom", start: "top 78%", once: true },
        });
        bottomTl
          .from(".vs-zones-title", { y: 32, opacity: 0, duration: 0.8, ease: "power2.out" })
          .from(
            ".score-zone-card",
            { y: 28, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
            "-=0.5"
          )
          .from(".vs-quote", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
          .from(".vs-cta", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");

        return () => {
          introTl.kill();
          bottomTl.kill();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".vs-title",
            ".vs-paragraph",
            ".vs-card",
            ".vs-carousel",
            ".vs-zones-title",
            ".score-zone-card",
            ".vs-quote",
            ".vs-cta",
          ],
          { clearProps: "all" }
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  const dimension = scoreDimensions[activeIndex];

  return (
    <section
      id="visio-score"
      ref={sectionRef}
      className="flex min-h-screen flex-col justify-center overflow-hidden bg-cream py-28 lg:pt-22.5 lg:pb-40"
    >
      <SectionContainer>
        {/* Top: title + description | dimension card (heading top-aligned) */}
        <div className={`grid grid-cols-1 items-start gap-y-10 ${COLUMN_GRID} lg:gap-x-12`}>
          <div>
            <h2 className="vs-title font-heading text-[40px] leading-[1.1] font-normal text-navy lg:-mt-2">
              Percepção
              <br />
              em número
            </h2>
            <p className="vs-paragraph mt-4 max-w-md font-sans text-[16px] leading-[18px] font-medium text-navy/70">
              O Visio Score™ é o instrumento de medição proprietário da Visio
              Nexum. Calcula a coerência e solidez de percepção de uma empresa em{" "}
              <span className="text-plum">4 dimensões</span> com{" "}
              <span className="text-gold">20 critérios verificáveis</span> — não
              opiniões, evidência.
            </p>
          </div>

          <div ref={cardRef} className="vs-card">
            <DimensionCard data={dimension} />
          </div>
        </div>

        {/* Carousel controls */}
        <div className="vs-carousel relative mt-10 flex items-center justify-center lg:mt-14">
          <p className="font-heading text-5xl font-normal text-navy">
            {String(activeIndex + 1).padStart(2, "0")}
            <span className="text-2xl text-navy/40">
              /{String(total).padStart(2, "0")}
            </span>
          </p>
          <div className="absolute right-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Dimensão anterior"
              className="flex size-11 items-center justify-center rounded-full bg-[#DAF0FF] text-navy transition-colors hover:bg-[#c4e8ff]"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Próxima dimensão"
              className="flex size-11 items-center justify-center rounded-full bg-[#DAF0FF] text-navy transition-colors hover:bg-[#c4e8ff]"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Bottom: score meaning — editorial staggered zones (low scores sit
            lower-left, high scores rise to the upper-right). */}
        <div className="vs-bottom mt-20 lg:mt-28">
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2 lg:items-start">
            {/* Left group: heading + the two lower zones */}
            <div>
              <h3 className="vs-zones-title font-heading text-[36px] leading-[1.15] font-normal text-navy">
                O que o seu score significa.{" "}
                <span className="align-middle font-sans text-sm font-normal text-navy/40">
                  As 4 zonas
                </span>
              </h3>
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <ScoreZoneCard data={zone0} />
                <ScoreZoneCard data={zone1} />
              </div>
            </div>

            {/* Right group: the two higher zones + quote */}
            <div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <ScoreZoneCard data={zone2} />
                <ScoreZoneCard data={zone3} />
              </div>
              <blockquote className="vs-quote mt-8 max-w-md font-sans text-sm leading-relaxed text-navy/60">
                &ldquo;Um cliente com score 44 não discute o preço da fundação da
                mesma forma que discute conceitos abstractos de percepção. O
                número torna o problema real.&rdquo;
              </blockquote>
            </div>
          </div>

          <div className="vs-cta mt-14 text-center lg:mt-20">
            <p className="font-sans text-2xl font-semibold text-navy">
              Qual é o Visio Score da sua empresa?
            </p>
            <ButtonLink
              href="#contato"
              variant="pillOutline"
              size="pill"
              className="mt-4 border-navy bg-lavender text-navy hover:bg-lavender/80"
            >
              Diagnóstico ↗
            </ButtonLink>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}

export { VisioScoreSection };
