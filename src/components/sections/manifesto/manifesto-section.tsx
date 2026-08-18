"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, SplitText } from "@/lib/gsap";
import { scrollToElement } from "@/lib/virtual-scroll";
import { SectionContainer } from "@/components/shared/section-container";

function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sentences = gsap.utils.toArray<HTMLElement>(".manifesto-sentence");
        const splits = sentences.map((sentence) =>
          SplitText.create(sentence, {
            type: "words",
            wordsClass: "manifesto-word",
          })
        );

        const REVEAL_X = 90;
        const REVEAL_Y = 56;
        const BLUR = "blur(16px)";

        splits.forEach((split) => {
          gsap.set(split.words, { x: REVEAL_X, y: REVEAL_Y, opacity: 0, filter: BLUR });
        });

        // Anchored to the paragraph itself, not the full h-screen section,
        // so the reveal/exit windows stay tight and the text is on-screen
        // throughout. The two triggers meet exactly at "center center", so
        // the text is fully sharp precisely when it's centered in the
        // viewport.
        const enterTl = gsap.timeline({
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 85%",
            end: "center center",
            scrub: true,
          },
        });
        splits.forEach((split, index) => {
          const words = split.words;
          const duration = 0.6 + words.length * 0.05;
          enterTl.to(
            words,
            {
              x: 0,
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              stagger: 0.05,
              duration,
              ease: "power2.out",
            },
            index === 0 ? 0 : "-=0.45"
          );
        });

        // Exit continues the same motion direction rather than reversing
        // it, over an equally tight window so it finishes while the text is
        // still on-screen. Once it finishes (scrolling past "end"), hands
        // off to sobre-nós — snapping the scroll so that section lands
        // fully framed before its own entrance plays.
        const exitTl = gsap.timeline({
          scrollTrigger: {
            trigger: textRef.current,
            start: "center center",
            end: "bottom 15%",
            scrub: true,
            onLeave: () => {
              const sobreNos = document.getElementById("sobre-nos");
              if (sobreNos) {
                scrollToElement(sobreNos, undefined, () => {
                  window.dispatchEvent(new CustomEvent("sobre-nos:snapped"));
                });
              }
            },
          },
        });
        splits.forEach((split, index) => {
          const words = split.words;
          const duration = 0.6 + words.length * 0.05;
          exitTl.to(
            words,
            {
              x: -REVEAL_X,
              y: -REVEAL_Y,
              opacity: 0,
              filter: BLUR,
              stagger: 0.05,
              duration,
              ease: "power2.in",
            },
            index === 0 ? 0 : "-=0.45"
          );
        });

        return () => {
          enterTl.kill();
          exitTl.kill();
          splits.forEach((split) => split.revert());
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-cream"
    >
      <SectionContainer className="relative z-10">
        <p
          ref={textRef}
          className="font-heading max-w-245 text-[40px] leading-[60px] font-normal text-navy"
        >
          <span className="manifesto-sentence">
            A percepção não é o que dizes que és.
          </span>{" "}
          <span className="manifesto-sentence">
            É o que o mercado sente que és— e a distância entre as duas
            coisas <span className="text-gold">tem um custo mensurável</span>.
          </span>
        </p>
      </SectionContainer>
    </section>
  );
}

export { ManifestoSection };
