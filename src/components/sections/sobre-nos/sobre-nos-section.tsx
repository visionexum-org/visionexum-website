"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { scrollToElement } from "@/lib/virtual-scroll";
import { cn } from "@/lib/utils";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { valueCards } from "@/data/sobre-nos";
import type { ValueCardData } from "@/data/sobre-nos";

function ValueCard({
  data,
  className,
}: {
  data: ValueCardData;
  className?: string;
}) {
  return (
    // The slot fixes the grid row height; the card animates within it,
    // positioned absolutely against the slot's base. An animated auto-height
    // row would drift as cards sharing it grow at different rates.
    <div className={cn("value-card-slot relative self-end", className)}>
      <div className="value-card absolute inset-x-0 bottom-0 flex flex-col gap-3 rounded-[16px] bg-lavender p-5">
        <span className="value-card-reveal-item font-heading flex size-8 items-center justify-center rounded-full bg-white text-[20px] leading-none text-navy">
          {data.number}
        </span>
        <div className="flex flex-col gap-3">
          <h3 className="value-card-reveal-item font-sans text-[17px] leading-[22px] font-medium text-navy">
            {data.title}
          </h3>
          <p className="value-card-reveal-item font-sans text-[13px] leading-[19px] text-navy/70">
            {data.body}
          </p>
        </div>
      </div>
    </div>
  );
}

const [v1, v2, v3, v4, v5, v6] = valueCards;

function SobreNosSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const titleEl = gsap.utils.toArray<HTMLElement>(".sobre-nos-title")[0];
        const titleSplit = SplitText.create(titleEl, {
          type: "words",
          wordsClass: "sobre-nos-word",
        });

        const quoteSentences = gsap.utils.toArray<HTMLElement>(".sobre-quote-sentence");
        const quoteSplits = quoteSentences.map((sentence) =>
          SplitText.create(sentence, { type: "words", wordsClass: "sobre-quote-word" })
        );

        const slots = gsap.utils.toArray<HTMLElement>(".value-card-slot");
        const cards = gsap.utils.toArray<HTMLElement>(".value-card");

        gsap.set(titleSplit.words, { x: 60, y: 40, opacity: 0, filter: "blur(14px)" });
        quoteSplits.forEach((split) => {
          gsap.set(split.words, { y: 16, opacity: 0, filter: "blur(10px)" });
        });

        // Row height is set from the tallest card in the row rather than each
        // card's natural height, so shorter cards do not resolve visibly short
        // beside taller ones. A static grid achieves this through
        // align-self:stretch; an explicitly animated height must replicate it.
        // Measured synchronously before paint and before the collapse below, so
        // no full-height content is shown.
        const naturalHeights = cards.map((card) => card.getBoundingClientRect().height);
        const ROW_GROUPS = [
          [0, 1],
          [2, 3, 4, 5],
        ];
        const targetHeights = [...naturalHeights];
        ROW_GROUPS.forEach((group) => {
          const max = Math.max(...group.map((i) => naturalHeights[i]));
          group.forEach((i) => {
            targetHeights[i] = max;
          });
        });
        gsap.set(slots, { height: (i) => targetHeights[i] });
        gsap.set(cards, { height: 10, overflow: "hidden" });
        const revealItems = cards.map((card) =>
          Array.from(card.querySelectorAll<HTMLElement>(".value-card-reveal-item"))
        );
        revealItems.forEach((items) => gsap.set(items, { y: 10, opacity: 0 }));

        // Paused rather than driven by its own ScrollTrigger: a scroll-position
        // threshold at "fully framed" is unreliable against the virtual
        // scroll's eased settle. Playback is triggered by the
        // "sobre-nos:snapped" event, dispatched once the preceding hand-off
        // completes. The ScrollTrigger below covers arrival by any other route.
        const tl = gsap.timeline({ paused: true });

        tl.to(
          titleSplit.words,
          {
            x: 0,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.035,
            duration: 0.45,
            ease: "power2.out",
          },
          0
        );
        // A fixed label anchors the quote and the cards to the same point so
        // they run concurrently rather than in sequence.
        tl.addLabel("afterTitle");

        quoteSplits.forEach((split, index) => {
          tl.to(
            split.words,
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              stagger: 0.018,
              duration: 0.38,
              ease: "power2.out",
            },
            index === 0 ? "afterTitle-=0.15" : "-=0.22"
          );
        });

        // Each card grows from a 10px sliver to the shared row height, anchored
        // to the bottom of its fixed-height slot so it rises rather than
        // descends, after which its contents fade in from the top. The height
        // remains fixed rather than reverting to "auto", which would re-measure
        // the card's own content and break the uniform row height.
        cards.forEach((card, index) => {
          const items = revealItems[index];
          const cardTl = gsap.timeline({
            onComplete: () => gsap.set(card, { overflow: "visible" }),
          });
          cardTl
            .to(
              card,
              { height: targetHeights[index], duration: 0.4, ease: "power3.out" },
              0
            )
            .to(
              items,
              { y: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: "power2.out" },
              "-=0.18"
            );
          tl.add(cardTl, index === 0 ? "afterTitle+=0.05" : "<+=0.06");
        });

        const play = () => tl.play();
        window.addEventListener("sobre-nos:snapped", play);

        // Positioned well beyond the point at which the hand-off normally
        // fires, so it does not pre-empt the synchronised snap during ordinary
        // top-to-bottom scrolling.
        const fallbackST = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 50%",
          once: true,
          onEnter: play,
        });

        // The exit is bound to scroll position rather than to a timed tween, so
        // it overlaps with the following section entering beneath it. On
        // completion it hands off to that section, snapping the scroll so it is
        // fully framed before its entrance plays.
        const content = gsap.utils.toArray<HTMLElement>(".sobre-nos-content")[0];
        // Anchored to the section's own bottom rather than to the viewport. A
        // viewport-anchored window is equivalent only while the section is
        // exactly one viewport tall; where the cards stack and the section runs
        // taller it expires before the content has been read. Anchoring to the
        // bottom covers the same 60vh once the section has been seen in full,
        // and is identical on viewports where the two coincide.
        const exitTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "bottom bottom",
            end: "bottom 40%",
            scrub: true,
            onLeave: () => {
              const metodo = document.getElementById("metodo");
              if (metodo) {
                scrollToElement(metodo, undefined, () => {
                  window.dispatchEvent(new CustomEvent("metodo:snapped"));
                });
              }
            },
          },
        }).to(content, { y: -60, opacity: 0, ease: "power1.in" }, 0);

        return () => {
          window.removeEventListener("sobre-nos:snapped", play);
          fallbackST.kill();
          exitTl.kill();
          tl.kill();
          titleSplit.revert();
          quoteSplits.forEach((split) => split.revert());
          // React Strict Mode double-invokes this effect in development.
          // Natural height is restored here so the second run does not
          // re-measure while collapsed, which would freeze the reveal.
          gsap.set(cards, { height: "auto", overflow: "visible" });
          revealItems.forEach((items) => gsap.set(items, { clearProps: "y,opacity" }));
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="sobre-nos"
      ref={sectionRef}
      className="flex min-h-screen flex-col justify-center bg-background py-16 lg:py-20"
    >
      <SectionContainer>
        {/* One 4-column grid: heading + quote share the header row, cards
            1–2 sit beneath the heading, cards 3–6 fill the row below. */}
        <div className="sobre-nos-content grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
          <SectionTitle className="sobre-nos-title self-start sm:col-span-2 lg:col-span-2 lg:row-start-1">
            Nossos Valores
          </SectionTitle>

          <blockquote className="sobre-nos-quote self-start text-justify font-sans text-[18px] leading-[26px] text-navy sm:col-span-2 lg:col-span-2 lg:col-start-3 lg:row-span-2 lg:row-start-1">
            <span className="sobre-quote-sentence">
              &ldquo;A Visio Nexum nasceu de uma observação simples: empresas
              angolanas excelentes a perder negócio para concorrentes apenas
              mais bem percepcionados.
            </span>{" "}
            <span className="sobre-quote-sentence">
              Foi para fechar essa distância que criámos o{" "}
              <span className="font-semibold text-plum">Visio Method™</span> —
              não campanhas, mas arquitectura de percepção, documentada e
              mensurável pelo{" "}
              <span className="font-semibold text-gold">Visio Score™</span>.
              &rdquo;
            </span>
          </blockquote>

          <ValueCard data={v1} className="lg:col-start-1 lg:row-start-2" />
          <ValueCard data={v2} className="lg:col-start-2 lg:row-start-2" />
          <ValueCard data={v3} className="lg:col-start-1 lg:row-start-3" />
          <ValueCard data={v4} className="lg:col-start-2 lg:row-start-3" />
          <ValueCard data={v5} className="lg:col-start-3 lg:row-start-3" />
          <ValueCard data={v6} className="lg:col-start-4 lg:row-start-3" />
        </div>
      </SectionContainer>
    </section>
  );
}

export { SobreNosSection };
