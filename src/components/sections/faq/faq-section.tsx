"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, SplitText } from "@/lib/gsap";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { faqItems } from "@/data/faq";
import { FaqItem } from "@/components/sections/faq/faq-item";

function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>(".faq-item");
        const questions = gsap.utils.toArray<HTMLElement>(".faq-question");
        const questionSplits = questions.map((question) =>
          SplitText.create(question, { type: "lines", linesClass: "faq-question-line" })
        );

        gsap.set(items, { y: 60, scale: 0.4, opacity: 0 });
        questionSplits.forEach((split) => gsap.set(split.lines, { y: -20, opacity: 0 }));

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
        });

        tl.from(".faq-eyebrow", {
          y: 16,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        }).from(
          ".faq-title",
          { y: 24, opacity: 0, filter: "blur(8px)", duration: 0.8, ease: "power2.out" },
          "-=0.4"
        );

        // Staircase: every question rises and scales up from 40% together,
        // each starting a beat after the last — the growing-from-small
        // motion, cascading down the list, reads as a perspective/depth
        // effect. Each item's own question then slides its lines down into
        // place as the item settles.
        items.forEach((item, index) => {
          const itemTl = gsap.timeline();
          itemTl.to(item, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" }, 0);
          itemTl.to(
            questionSplits[index].lines,
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" },
            "-=0.3"
          );
          tl.add(itemTl, index === 0 ? "-=0.2" : "<+=0.12");
        });

        return () => {
          tl.kill();
          questionSplits.forEach((split) => split.revert());
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="flex min-h-screen flex-col justify-center bg-cream py-28 lg:py-40"
    >
      <SectionContainer>
        <div className="mx-auto max-w-2xl text-center">
          <span className="faq-eyebrow font-sans text-sm font-medium tracking-[0.2em] text-navy/50 uppercase">
            FAQ
          </span>
          <SectionTitle className="faq-title mt-4 text-center">
            O que mais nos perguntam.
          </SectionTitle>
        </div>

        <div className="mt-16">
          {faqItems.map((item, index) => (
            <FaqItem
              key={item.question}
              data={item}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((current) => (current === index ? null : index))
              }
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

export { FaqSection };
