import Image from "next/image";

import { GlassCard } from "@/components/shared/glass-card";
import { heroCards } from "@/data/hero";
import type {
  ScoreBadgeCardData,
  StatCardData,
  TestimonialCardData,
} from "@/data/hero";

const [statPrimary, statSecondary, scoreBadge, testimonial] = heroCards as [
  StatCardData,
  StatCardData,
  ScoreBadgeCardData,
  TestimonialCardData,
];

function StatCardContent({ data }: { data: StatCardData }) {
  return (
    <div className="flex flex-col gap-3 p-6">
      {data.eyebrow && (
        <span className="text-xs text-white/60">{data.eyebrow}</span>
      )}
      <p className="font-heading text-3xl font-bold text-white">
        <span className="text-gold">{data.value}</span>{" "}
        <span className="text-lg font-medium text-white/90">
          {data.valueSuffix}
        </span>
      </p>
      <p className="text-sm leading-relaxed text-white/60">
        {data.description}
      </p>
    </div>
  );
}

function ScoreBadgeCardContent({ data }: { data: ScoreBadgeCardData }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <span className="text-xs text-white/60">{data.label}</span>
      <div className="flex items-center gap-2 text-sm text-white/90">
        <span>
          Antes <span className="font-semibold">{data.before}</span>
        </span>
        <span className="text-gold">→</span>
        <span>
          Depois <span className="font-semibold">{data.after}</span>
        </span>
      </div>
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">
        <span className="size-1.5 rounded-full bg-gold" />
        {data.delta}
      </span>
    </div>
  );
}

function TestimonialCardContent({ data }: { data: TestimonialCardData }) {
  return (
    <div className="flex flex-col gap-3 p-6">
      <div className="flex items-center gap-3">
        <Image
          src={data.avatarSrc}
          alt={data.name}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-white">{data.name}</p>
          <p className="text-xs text-white/60">{data.role}</p>
        </div>
      </div>
      <p className="text-sm italic leading-relaxed text-white/75">
        &ldquo;{data.quote}&rdquo;
      </p>
    </div>
  );
}

function HeroCards() {
  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col lg:mx-0">
      <GlassCard tint="bg-indigo-deep/50" className="hero-card">
        <StatCardContent data={statPrimary} />
      </GlassCard>

      <div className="relative -mt-4 ml-6 lg:ml-12">
        <GlassCard tint="bg-plum/50" className="hero-card">
          <StatCardContent data={statSecondary} />
        </GlassCard>

        <GlassCard
          tint="bg-navy/80"
          className="hero-card absolute -bottom-6 -right-3 w-44 lg:-right-8"
        >
          <ScoreBadgeCardContent data={scoreBadge} />
        </GlassCard>
      </div>

      <GlassCard tint="bg-navy/70" className="hero-card mt-8 mr-6 lg:mr-12">
        <TestimonialCardContent data={testimonial} />
      </GlassCard>
    </div>
  );
}

export { HeroCards };
