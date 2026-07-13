import { ButtonLink } from "@/components/ui/button";

function HeroContent() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="hero-heading font-heading max-w-xl text-[32px] font-bold leading-9.5 tracking-tight text-white lg:max-w-154 lg:text-[40px] lg:leading-11.5">
        <span className="text-gold">Não fazemos campanhas</span>
        <span className="text-white">.</span>
        <br />
        <span className="text-white">
          Construímos a fundação da sua percepção.
        </span>
      </h1>

      <p className="hero-subtext max-w-lg text-[20px] leading-7 text-white/70 lg:max-w-147.25">
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
