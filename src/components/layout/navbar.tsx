"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Menu, X } from "lucide-react";

import { gsap } from "@/lib/gsap";
import { navLinks } from "@/data/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { SectionContainer } from "@/components/shared/section-container";

function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useGSAP(
    () => {
      gsap.fromTo(
        navRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.15 }
      );
    },
    { scope: navRef }
  );

  return (
    <header ref={navRef} className="fixed inset-x-0 top-0 z-20">
      <SectionContainer className="flex items-center justify-between py-6">
        <a href="#home" aria-label="Visio Nexum — Home">
          <Logo className="h-6 w-auto text-white" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/85 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="hidden h-1 w-1 rounded-full bg-white/40 lg:block"
          />
          <ButtonLink
            href="#contato"
            variant="pillSolid"
            size="pill"
            className="hidden lg:inline-flex"
          >
            Diagnóstico ↗
          </ButtonLink>

          <button
            type="button"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex size-9 items-center justify-center rounded-full text-white lg:hidden"
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </SectionContainer>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-navy/95 backdrop-blur-xl lg:hidden">
          <SectionContainer className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-2 py-3 text-white/90 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <ButtonLink
              href="#contato"
              variant="pillSolid"
              size="pill"
              className="mt-2 w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Diagnóstico ↗
            </ButtonLink>
          </SectionContainer>
        </div>
      )}
    </header>
  );
}

export { Navbar };
