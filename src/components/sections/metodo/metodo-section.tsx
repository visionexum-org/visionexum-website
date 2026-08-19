"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { methodPhases } from "@/data/metodo";
import type { MethodPhaseData } from "@/data/metodo";

const CARD_BACKGROUNDS = [
  "/images/metodo/fase-1-bg.png",
  "/images/metodo/fase-2-bg.png",
  "/images/metodo/fase-3-bg.png",
];

function PhaseCard({ data, bgImage }: { data: MethodPhaseData; bgImage: string }) {
  const [firstWord, ...restWords] = data.title.split(" ");
  const restOfTitle = restWords.join(" ");

  return (
    <div className="method-card flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_4px_24px_rgba(0,31,53,0.08)]">
      <div className="relative flex aspect-450/176 w-full flex-col justify-between p-4">
        <Image src={bgImage} alt="" fill className="object-cover" />
        <span className="relative w-fit rounded-full bg-white px-3 py-1 text-xs text-navy">
          {data.phase}
        </span>
        <h3 className="method-card-title relative text-right font-sans text-[24px] leading-6.75 font-medium text-white">
          {firstWord}
          <br />
          {restOfTitle}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 pt-14 pb-4">
        <span className="method-card-dash h-0.5 w-6 bg-navy" />
        <p className="method-card-body font-sans text-[13px] leading-4.25 font-normal text-navy/70">
          {data.description}
        </p>
        <div className="method-card-meta grid grid-cols-[2fr_3fr] gap-4">
          <div>
            <p className="font-sans text-[13px] leading-4.25 font-semibold text-navy">
              {data.durationLabel ?? "Duração"}
            </p>
            <p className="mt-1 font-sans text-[12px] leading-[16px] font-normal text-navy/70">
              {data.duration}
            </p>
          </div>
          <div>
            <p className="font-sans text-[13px] leading-4.25 font-semibold text-navy">
              {data.deliverablesLabel ?? "Entregáveis"}
            </p>
            <p className="mt-1 font-sans text-[12px] leading-[16px] font-normal text-navy/70">
              {data.deliverables}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetodoSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Heading and subheading are split into words for a slide-and-fade
        // cascade, applied sentence by sentence.
        const titleSentences = gsap.utils.toArray<HTMLElement>(".metodo-title-sentence");
        const titleSplits = titleSentences.map((sentence) =>
          SplitText.create(sentence, { type: "words", wordsClass: "metodo-title-word" })
        );
        const paraSentences = gsap.utils.toArray<HTMLElement>(".metodo-paragraph-sentence");
        const paraSplits = paraSentences.map((sentence) =>
          SplitText.create(sentence, { type: "words", wordsClass: "metodo-paragraph-word" })
        );
        titleSplits.forEach((split) => gsap.set(split.words, { y: 28, opacity: 0 }));
        paraSplits.forEach((split) => gsap.set(split.words, { y: 14, opacity: 0 }));

        // Divider: drawn left to right.
        const divider = gsap.utils.toArray<HTMLElement>(".metodo-divider")[0];
        gsap.set(divider, { scaleX: 0, transformOrigin: "left" });

        const cards = gsap.utils.toArray<HTMLElement>(".method-card");
        const cardTitles = gsap.utils.toArray<HTMLElement>(".method-card-title");
        const cardDashes = gsap.utils.toArray<HTMLElement>(".method-card-dash");
        const cardMetas = gsap.utils.toArray<HTMLElement>(".method-card-meta");
        const cardBodies = gsap.utils.toArray<HTMLElement>(".method-card-body");

        gsap.set(cards, { x: 60, opacity: 0 });
        gsap.set(cardTitles, { y: -20, opacity: 0 });
        gsap.set(cardDashes, { scaleX: 0, transformOrigin: "right" });
        gsap.set(cardMetas, { y: 10, opacity: 0 });

        // Body copy is split into lines, each covered by an absolutely
        // positioned skeleton bar; the text itself remains in place beneath.
        // Each bar draws in left to right and then erases in the same
        // direction, so the text is uncovered rather than faded in.
        const bodySplits = cardBodies.map((body) =>
          SplitText.create(body, { type: "lines", linesClass: "method-body-line" })
        );
        const bodyOverlays = bodySplits.map((split) =>
          split.lines.map((line) => {
            gsap.set(line, { position: "relative" });
            const overlay = document.createElement("span");
            overlay.className =
              "method-body-skeleton pointer-events-none absolute inset-0 rounded-[3px] bg-navy/12";
            line.appendChild(overlay);
            gsap.set(overlay, { scaleX: 0, transformOrigin: "left" });
            return overlay;
          })
        );

        // Paused rather than driven by its own ScrollTrigger, and played from
        // the "metodo:snapped" event dispatched once the preceding hand-off
        // completes. A scroll-position threshold at "fully framed" is
        // unreliable against the virtual scroll's eased settle. The
        // ScrollTrigger below covers arrival by any other route.
        //
        // Every group starts at position 0 so the section resolves as a whole;
        // staggers are retained within each group to preserve texture.
        const tl = gsap.timeline({ paused: true });

        titleSplits.forEach((split) => {
          tl.to(
            split.words,
            { y: 0, opacity: 1, stagger: 0.03, duration: 0.5, ease: "power2.out" },
            0
          );
        });

        paraSplits.forEach((split) => {
          tl.to(
            split.words,
            { y: 0, opacity: 1, stagger: 0.014, duration: 0.45, ease: "power2.out" },
            0
          );
        });

        tl.to(divider, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0);

        // The cards enter as one group. Each retains its internal choreography
        // (title, dash, skeleton lines) but all three begin together.
        cards.forEach((card, index) => {
          const items = bodyOverlays[index];
          const cardTl = gsap.timeline();

          cardTl.to(card, { x: 0, opacity: 1, duration: 0.45, ease: "power2.out" }, 0);
          cardTl.to(
            cardTitles[index],
            { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
            0
          );
          cardTl.to(
            cardDashes[index],
            { scaleX: 1, duration: 0.25, ease: "power2.out" },
            0.08
          );

          items.forEach((overlay, lineIndex) => {
            const lineStart = 0.12 + lineIndex * 0.045;
            cardTl
              .to(overlay, { scaleX: 1, duration: 0.14, ease: "power1.out" }, lineStart)
              .set(overlay, { transformOrigin: "right" })
              .to(overlay, { scaleX: 0, duration: 0.16, ease: "power1.inOut" });
          });

          cardTl.to(
            cardMetas[index],
            { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
            0.14
          );

          tl.add(cardTl, 0);
        });

        const play = () => tl.play();
        window.addEventListener("metodo:snapped", play);

        // Covers arrival by any other route, such as scrolling up from below or
        // a direct navigation link. The section fits within one viewport, so
        // waiting until it is mostly framed keeps the cards on screen for the
        // full sequence.
        const fallbackST = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 50%",
          once: true,
          onEnter: play,
        });

        return () => {
          window.removeEventListener("metodo:snapped", play);
          fallbackST.kill();
          tl.kill();
          titleSplits.forEach((split) => split.revert());
          paraSplits.forEach((split) => split.revert());
          bodyOverlays.forEach((overlays) => overlays.forEach((overlay) => overlay.remove()));
          bodySplits.forEach((split) => split.revert());
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="metodo"
      ref={sectionRef}
      className="flex min-h-screen flex-col justify-center bg-cream py-16 lg:py-20"
    >
      <SectionContainer>
        <SectionTitle className="leading-[1.1]">
          <span className="metodo-title-sentence">Percepção não se gere.</span>
          <br />
          <span className="metodo-title-sentence text-gold">Arquitecta-se.</span>
        </SectionTitle>
        <p className="mt-4 max-w-[932px] font-sans text-[16px] leading-6 font-normal text-navy/70">
          <span className="metodo-paragraph-sentence">
            O método parte de uma premissa simples: existe sempre uma
            distância entre o que uma empresa é e o que o mercado sente que
            é.
          </span>{" "}
          <span className="metodo-paragraph-sentence">
            Essa distância tem um custo.
          </span>{" "}
          <span className="metodo-paragraph-sentence">
            O Visio Method™ mede-a, arquitecta a solução e garante que se
            mantém fechada ao longo do tempo.
          </span>
        </p>

        <div className="metodo-divider mt-5 h-px w-full bg-navy/15" />

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-4">
          {methodPhases.map((phase, index) => (
            <PhaseCard
              key={phase.phase}
              data={phase}
              bgImage={CARD_BACKGROUNDS[index]}
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

export { MetodoSection };
