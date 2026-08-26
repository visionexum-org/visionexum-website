import { GlassCard } from "@/components/shared/glass-card";
import { heroStat, heroScore } from "@/data/hero";

function StatCardContent() {
  return (
    <div className="flex h-full flex-col gap-2.5 p-4">
      <div className="flex flex-col gap-1">
        <span className="font-sans text-[11px] font-normal text-white/70">
          {heroStat.eyebrow}
        </span>
        <p>
          <span className="font-sans text-[28px] leading-none font-bold text-white">
            {heroStat.statValue}
          </span>{" "}
          <span className="font-sans text-xs font-normal text-white">
            {heroStat.statSuffix}
          </span>
        </p>
      </div>
      <p className="font-sans text-[11px] leading-4 font-normal text-white/75">
        {heroStat.description}
      </p>
    </div>
  );
}

function ScoreCardContent() {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex flex-col gap-2">
        <p className="font-sans text-lg font-bold text-gold">
          {heroScore.heading}
        </p>
        <p className="font-sans text-[11px] leading-4 font-normal text-white/75">
          {heroScore.description}
        </p>
      </div>
      <p className="text-right font-sans text-xs font-semibold text-gold">
        {heroScore.cta}
      </p>
    </div>
  );
}

function HeroCards() {
  return (
    // Heights track the viewport rather than being fixed in pixels. The stack is
    // the tallest fixed element in the hero, so at a shorter viewport — which is
    // what a 125% display scale produces — fixed heights claimed a visibly
    // larger share of the screen. The lower bounds are the heights the content
    // itself requires at this width.
    <div className="flex w-full flex-col gap-4 lg:ml-auto lg:max-w-95">
      <GlassCard className="hero-card h-[clamp(126px,14vh,152px)]">
        <StatCardContent />
      </GlassCard>
      <GlassCard className="hero-card h-[clamp(132px,12vh,140px)]">
        <ScoreCardContent />
      </GlassCard>
    </div>
  );
}

export { HeroCards };
