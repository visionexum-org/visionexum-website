import { GlassCard } from "@/components/shared/glass-card";
import { heroStat, heroScore } from "@/data/hero";

const cardTint = "bg-[#d4d4d4]/10";

function StatCardContent() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
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
    <div className="flex h-full flex-col justify-between p-5">
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
    <div className="flex w-full flex-col gap-5 lg:ml-auto lg:max-w-95">
      <GlassCard tint={cardTint} bordered={false} className="hero-card h-42">
        <StatCardContent />
      </GlassCard>
      <GlassCard tint={cardTint} bordered={false} className="hero-card h-[134px]">
        <ScoreCardContent />
      </GlassCard>
    </div>
  );
}

export { HeroCards };
