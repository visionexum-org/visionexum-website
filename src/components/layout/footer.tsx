"use client";

import { useRef, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";

import { gsap } from "@/lib/gsap";
import { Logo } from "@/components/shared/logo";
import { ColorBends } from "@/components/shared/color-bends";
import { navLinks } from "@/data/navigation";
import { socialLinks } from "@/data/social";
import {
  FacebookIcon,
  LinkedinIcon,
  InstagramIcon,
  TiktokIcon,
} from "@/components/shared/social-icons";

const socialIcons = {
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
};

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getAllowMotionSnapshot() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getAllowMotionServerSnapshot() {
  return false;
}

function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const allowMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getAllowMotionSnapshot,
    getAllowMotionServerSnapshot
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
            once: true,
          },
        });

        tl.from(".footer-content > *", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
        });

        return () => tl.kill();
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".footer-content > *", { clearProps: "all" });
      });

      return () => mm.revert();
    },
    { scope: footerRef }
  );

  return (
    <footer ref={footerRef} className="bg-cream pt-4 lg:pt-8">
      <div className="relative overflow-hidden rounded-t-[16px] bg-black px-8 py-12 lg:px-16 lg:py-14">
        {allowMotion && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <ColorBends
              colors={["#0086ff"]}
              rotation={90}
              speed={0.2}
              scale={1}
              frequency={1.2}
              warpStrength={0.97}
              mouseInfluence={0.8}
              noise={0.32}
              parallax={0.25}
              iterations={2}
              intensity={1.5}
              bandWidth={5}
              autoRotate={0}
              transparent
            />
          </div>
        )}

        <Logo
          aria-hidden="true"
          className="relative mb-10 h-8.5 w-auto text-white lg:absolute lg:top-14 lg:left-16 lg:mb-0"
        />

        <div className="footer-content relative grid grid-cols-1 gap-12 lg:grid-cols-2 lg:pl-[44%]">
          <div>
            <h3 className="font-heading text-xl font-normal text-white">
              Nos acompanhe online:
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {socialLinks.map((social) => {
                const Icon = socialIcons[social.icon];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 font-sans text-sm text-navy transition-colors hover:bg-white/80"
                  >
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                      <Icon className="size-3.5" />
                    </span>
                    {social.handle}
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-xl font-normal text-white">
              Links rápidos
            </h3>
            <ul className="mt-6 flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-sans text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-content relative mt-20 flex flex-col gap-3 sm:mt-28 sm:flex-row sm:items-center sm:justify-between lg:mt-32">
          <p className="font-sans text-sm text-white/70">
            © {new Date().getFullYear()} Visio Nexum. Todos os direitos
            reservados.
          </p>
          <a
            href="/privacidade"
            className="font-sans text-sm text-white/70 transition-colors hover:text-white"
          >
            Política de Privacidade
          </a>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
