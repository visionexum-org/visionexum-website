import { ButtonLink } from "@/components/ui/button";

function HeroContent() {
  return (
    <div className="flex flex-col gap-8">
      <h1
        aria-label="Não fazemos campanhas. Construímos a fundação da sua percepção."
        className="font-heading text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
      >
        <span aria-hidden="true" className="block overflow-hidden">
          <span className="hero-heading-line inline-block">
            <span className="text-gold">Não fazemos campanhas</span>.
          </span>
        </span>
        <span aria-hidden="true" className="block overflow-hidden">
          <span className="hero-heading-line inline-block">
            Construímos a fundação da sua
          </span>
        </span>
        <span aria-hidden="true" className="block overflow-hidden">
          <span className="hero-heading-line inline-block">percepção.</span>
        </span>
      </h1>

      <p className="hero-subtext max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
        Ajudamos PMEs angolanas a transformar percepção numa vantagem
        estratégica mensurável — através do Visio Method™.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <ButtonLink
          href="#contato"
          variant="pillSolid"
          size="pill"
          className="hero-cta-item"
        >
          Diagnóstico ↗
        </ButtonLink>
        <ButtonLink
          href="#metodo"
          variant="pillOutline"
          size="pill"
          className="hero-cta-item"
        >
          Método ↗
        </ButtonLink>
      </div>
    </div>
  );
}

export { HeroContent };
