"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";

import { gsap, SplitText } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { setScrollLocked } from "@/lib/virtual-scroll";
import { navLinks } from "@/data/navigation";
import { socialLinks } from "@/data/social";
import { ArrowUpRight } from "@/components/shared/icons";

const subscribeNoop = () => () => {};

// Ported from the codegrid overlay-menu reference: four backing panels wipe
// down on staggered scaleY, the item panel is revealed by clip-path just
// before they land, and the links then rise line by line behind their own
// masks. Only the palette and the copy differ.
const PANELS = ["bg-[#b8975a]", "bg-[#4a3b8c]", "bg-[#0086ff]", "bg-[#003a63]"];

function MobileMenu() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const linkBlocksRef = useRef<string[]>([]);
  const isAnimating = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  // The overlay is portalled to document.body, which does not exist while the
  // component renders on the server. This reports false there and true once
  // hydrated, so GSAP setup waits for a scope that actually has nodes in it.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useGSAP(
    () => {
      if (!mounted || !overlayRef.current) return;
      // The overlay is lg:hidden, and SplitText cannot measure lines inside a
      // display:none subtree — it would produce nothing and every later
      // selector would log a missing target. Desktop has no use for any of
      // this anyway.
      if (!window.matchMedia("(max-width: 1023px)").matches) return;

      // The CTA is deliberately left out of the split — it carries an inline
      // SVG, which SplitText would tear out of its flow.
      const linkBlocks = [".menu-primary .line", ".menu-socials .line"];
      linkBlocksRef.current = linkBlocks;

      const splits = SplitText.create(".menu-primary a, .menu-socials a", {
        type: "lines",
        mask: "lines",
        linesClass: "line",
      });

      gsap.set(linkBlocks, { y: "100%" });
      gsap.set(".menu-cta", { y: 20, opacity: 0 });

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          isAnimating.current = false;
        },
        onReverseComplete: () => {
          gsap.set(linkBlocks, { y: "100%" });
          gsap.set(".menu-cta", { y: 20, opacity: 0 });
          isAnimating.current = false;
        },
      });

      tl.to(".menu-panel", {
        scaleY: 1,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.inOut",
      }).to(
        ".menu-items",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.75,
          ease: "power3.inOut",
        },
        "-=0.6"
      );

      timelineRef.current = tl;

      return () => {
        tl.kill();
        splits.revert();
      };
    },
    { dependencies: [mounted], scope: overlayRef }
  );

  const animateLinksIn = () => {
    linkBlocksRef.current.forEach((selector) => {
      gsap.fromTo(
        selector,
        { y: "100%" },
        { y: "0%", duration: 0.75, stagger: 0.05, ease: "power3.out", delay: 0.85 }
      );
    });
    gsap.to(".menu-cta", {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
      delay: 1.05,
    });
  };

  const toggle = () => {
    const tl = timelineRef.current;
    if (!tl || isAnimating.current) return;
    isAnimating.current = true;

    if (!isOpen) {
      tl.play();
      animateLinksIn();
    } else {
      tl.reverse();
    }
    setIsOpen((open) => !open);
  };

  const close = () => {
    const tl = timelineRef.current;
    if (!tl || !isOpen) return;
    isAnimating.current = true;
    tl.reverse();
    setIsOpen(false);
  };

  useEffect(() => {
    setScrollLocked(isOpen);
    return () => setScrollLocked(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const overlay = (
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-40 overflow-hidden lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      {PANELS.map((tone) => (
        <div
          key={tone}
          className={cn(
            "menu-panel absolute inset-0 origin-top scale-y-0 will-change-transform",
            tone
          )}
        />
      ))}

      <div
        className="menu-items absolute inset-0 flex flex-col justify-center gap-9 bg-navy px-8 pt-24 pb-12 will-change-[clip-path]"
        style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }}
      >
        <nav className="menu-primary flex flex-col">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              tabIndex={isOpen ? 0 : -1}
              className="block font-heading text-[32px] leading-[1.15] font-normal tracking-[-0.02em] text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contato"
          onClick={close}
          tabIndex={isOpen ? 0 : -1}
          className="menu-cta inline-flex w-fit items-center gap-2 rounded-full bg-lavender px-5 py-3 font-sans text-sm text-navy"
        >
          Diagnóstico <ArrowUpRight className="size-3" />
        </a>

        <div className="menu-socials flex flex-col">
          {socialLinks.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              tabIndex={isOpen ? 0 : -1}
              className="block font-sans text-[15px] leading-relaxed text-white/55"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isOpen}
        className="flex size-9 flex-col items-center justify-center gap-[5px] lg:hidden"
      >
        <span
          className={cn(
            "block h-0.5 w-6 bg-white transition-transform duration-400 ease-out",
            isOpen && "translate-y-[3.5px] rotate-45 scale-x-75"
          )}
        />
        <span
          className={cn(
            "block h-0.5 w-6 bg-white transition-transform duration-400 ease-out",
            isOpen && "-translate-y-[3.5px] -rotate-45 scale-x-75"
          )}
        />
      </button>

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}

export { MobileMenu };
