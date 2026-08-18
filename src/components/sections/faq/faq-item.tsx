"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Minus, Plus } from "lucide-react";

import { gsap } from "@/lib/gsap";
import type { FaqItemData } from "@/data/faq";

function FaqItem({
  data,
  isOpen,
  onToggle,
}: {
  data: FaqItemData;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;

      if (isFirstRun.current) {
        isFirstRun.current = false;
        gsap.set(panel, { height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 });
        return;
      }

      if (isOpen) {
        gsap.to(panel, {
          height: "auto",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        });
      } else {
        gsap.to(panel, {
          height: 0,
          opacity: 0,
          duration: 0.35,
          ease: "power2.inOut",
        });
      }
    },
    { dependencies: [isOpen] }
  );

  return (
    <div className="faq-item relative border-b border-navy/10 py-7 pr-16">
      <h3 className="faq-question font-sans text-xl font-semibold text-navy">
        {data.question}
      </h3>

      <div ref={panelRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
        <p className="max-w-2xl pt-4 font-sans text-base leading-relaxed text-navy/70">
          {data.answer}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fechar pergunta" : "Abrir pergunta"}
        className="absolute right-0 bottom-3 inline-flex size-7 items-center justify-center rounded-full bg-navy text-cream transition-transform duration-300 hover:scale-105"
      >
        {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
      </button>
    </div>
  );
}

export { FaqItem };
