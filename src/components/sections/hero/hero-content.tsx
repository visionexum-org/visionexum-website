import { ButtonLink } from "@/components/ui/button";
import { ArrowUpRight } from "@/components/shared/icons";

// On mobile this sits in normal flow, stacked above the cards. At lg+ it
// switches to absolute positioning within the section's 1728px content
// frame (see hero-section.tsx). bottom-28.5 (114px) + the 40px pill button
// + gap-6.5 (26px) pins the heading's own bottom exactly 180px up — that
// math only anchors the bottom of the block, so the heading's own height
// is free to change without breaking it.
function HeroContent() {
  return (
    <div className="relative z-10 flex flex-col gap-5 px-6 lg:absolute lg:bottom-28.5 lg:left-24 lg:gap-6.5 lg:px-0">
      <h1 className="hero-heading font-heading text-[20px] leading-[1.25] font-bold text-white lg:w-157.5 lg:text-[24px] lg:leading-[1.2]">
        Ajudamos PMEs angolanas a transformar percepção numa vantagem
        estratégica mensurável — através do Visio Method™.
      </h1>

      <div className="flex flex-wrap items-center gap-4">
        <ButtonLink
          href="#contato"
          variant="pillSolid"
          size="pill"
          className="hero-cta-item text-sm"
        >
          Diagnóstico <ArrowUpRight className="size-3" />
        </ButtonLink>
        <ButtonLink
          href="#metodo"
          variant="pillOutline"
          size="pill"
          className="hero-cta-item text-sm"
        >
          Método <ArrowUpRight className="size-3" />
        </ButtonLink>
      </div>
    </div>
  );
}

export { HeroContent };
