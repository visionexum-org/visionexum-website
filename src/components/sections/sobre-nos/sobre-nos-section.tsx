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
    // The slot fixes the grid row's height; the card animates inside it,
    // absolutely positioned to the slot's floor. An animated auto-height
    // row would drift as two cards sharing it grow at different rates.
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

        // Row height matches the tallest card in that row, not each card's
        // own natural height, so shorter cards don't finish visibly stunted
        // next to taller row-mates (the plain grid did this via
        // align-self:stretch; an explicit animated height has to replicate
        // it manually). Measured synchronously before paint, before the
        // collapse below, so there's no flash of full-height content.
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

        // Paused, not driven by its own ScrollTrigger: a scroll-position
        // threshold at exactly "fully framed" is unreliable against the
        // virtual scroll's eased settle. Plays from the "sobre-nos:snapped"
        // event, dispatched once manifesto's own hand-off animation
        // actually completes. The ScrollTrigger fallback below covers
        // reaching this section any other way (scrolling up, a direct nav
        // link).
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
        // Anchors the quote and the cards to a fixed point rather than
        // chaining them, so both run concurrently instead of the cards
        // waiting for the quote to finish.
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

        // Each card grows from a 10px sliver to its row's shared height,
        // pinned to the bottom of its fixed-height slot so it rises rather
        // than drops; its contents then fade in top to bottom. Height stays
        // fixed after growing rather than resetting to "auto", which would
        // re-measure the card's own (possibly shorter) content and undo the
        // row's uniform height.
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

        // Sits well past where the manifesto hand-off would normally have
        // already fired, so it never pre-empts the synced snap during
        // ordinary top-to-bottom scrolling.
        const fallbackST = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 50%",
          once: true,
          onEnter: play,
        });

        // Exit is tied directly to scroll position, not a timed tween, so
        // it overlaps visually with método sliding in underneath. Once it
        // finishes, hands off to método the same way manifesto handed off
        // here — snapping the scroll so it lands fully framed before its
        // own entrance plays.
        const content = gsap.utils.toArray<HTMLElement>(".sobre-nos-content")[0];
        const exitTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "top -60%",
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
          // React Strict Mode double-invokes this effect in dev; without
          // restoring natural height here, the second run would re-measure
          // while still collapsed and permanently freeze the reveal.
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
