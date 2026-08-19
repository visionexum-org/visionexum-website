"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ArrowUpRight } from "@/components/shared/icons";
import { MobileMenu } from "@/components/layout/mobile-menu";

const diagnosticoClassName = "border-navy bg-lavender text-navy hover:bg-lavender/80";

function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const isFirstRun = useRef(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

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

  useGSAP(
    () => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }

      gsap.to(navRef.current, {
        yPercent: isHidden ? -100 : 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
    },
    { dependencies: [isHidden], scope: navRef }
  );

  useEffect(() => {
    const hero = document.getElementById("home");
    const heroObserver = hero
      ? new IntersectionObserver(
          ([entry]) => setIsScrolled(!entry.isIntersecting),
          { rootMargin: "-96px 0px 0px 0px" }
        )
      : null;
    if (hero && heroObserver) heroObserver.observe(hero);

    let lastScrollY = 0;
    const handleScroll = (currentY: number) => {
      if (currentY > lastScrollY && currentY > 120) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY = currentY;
    };

    const handleVirtualScroll = (e: Event) => {
      const { current } = (e as CustomEvent<{ current: number }>).detail;
      handleScroll(current);
    };

    window.addEventListener("virtualscroll", handleVirtualScroll);
    return () => {
      heroObserver?.disconnect();
      window.removeEventListener("virtualscroll", handleVirtualScroll);
    };
  }, []);

  // z-50 keeps the bar above the portalled menu overlay (z-40) so the logo and
  // the toggler stay reachable while it is open, mirroring the reference's
  // nav/nav-content stacking.
  return (
    <header ref={navRef} className="fixed inset-x-0 top-0 z-50">
      {/* Pill wrapper is a plain CSS transition, deliberately separate from
          the GSAP-driven <header> above (which only touches y/yPercent/
          opacity) — mixing transition-all with GSAP transforms on the same
          element causes fighting/jank, so this keeps its own explicit,
          transform-free property list. */}
      {/* Always a dark surface for the cursor: transparent over the navy hero
          at rest, and its own navy pill once scrolled. */}
      <div
        data-cursor-tone="light"
        className={cn(
          "mx-auto flex items-center justify-between transition-[width,max-width,margin-top,padding,border-radius,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out",
          isScrolled
            ? "mt-3 w-[calc(100%-2rem)] max-w-295 rounded-full border border-white/10 bg-navy/55 px-6 py-3 shadow-lg shadow-black/25 backdrop-blur-2xl lg:px-8"
            : "mt-0 w-full max-w-480 rounded-none border border-transparent bg-transparent px-6 py-6 shadow-none backdrop-blur-none lg:px-24"
        )}
      >
        <a href="#home" aria-label="Visio Nexum — Home">
          <Logo className="h-6 w-auto text-white" />
        </a>

        <div className="hidden items-center gap-7.25 lg:flex">
          <nav className="flex items-center gap-7.25">
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

          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/40" />

          <ButtonLink
            href="#contato"
            variant="pillOutline"
            size="pill"
            className={cn(diagnosticoClassName, "text-sm")}
          >
            Diagnóstico <ArrowUpRight className="size-3" />
          </ButtonLink>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}

export { Navbar };
