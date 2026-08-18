"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap } from "@/lib/gsap";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { ContactForm } from "@/components/sections/contato/contact-form";

function ContatoSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
        });

        tl.from(".contato-title", {
          y: 28,
          opacity: 0,
          filter: "blur(8px)",
          duration: 0.8,
          ease: "power2.out",
        })
          .from(
            ".contato-copy",
            { y: 20, opacity: 0, duration: 0.6, ease: "power2.out" },
            "-=0.5"
          )
          .from(
            ".contato-card",
            { y: 32, opacity: 0, duration: 0.8, ease: "power2.out" },
            "-=0.6"
          );

        return () => tl.kill();
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([".contato-title", ".contato-copy", ".contato-card"], {
          clearProps: "all",
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="contato"
      ref={sectionRef}
      className="flex min-h-screen flex-col justify-center bg-cream py-28 lg:py-40"
    >
      <SectionContainer>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[45fr_55fr] lg:gap-x-16">
          <div>
            <SectionTitle className="contato-title">
              O diagnóstico começa com uma conversa.
            </SectionTitle>
            <p className="contato-copy mt-6 max-w-md font-sans text-base leading-relaxed text-navy/70">
              15 minutos. Sem compromisso. Para perceber se faz sentido
              avançar.
            </p>
            <div className="contato-copy mt-8 max-w-md border-t border-navy/15 pt-8 font-sans text-base leading-relaxed text-navy/70">
              Todos podem comprar-nos. Mas não vendemos para todos.
            </div>
          </div>

          <div className="contato-card rounded-[32px] bg-[#D9D9D9] p-8 lg:p-10">
            <ContactForm />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}

export { ContatoSection };
