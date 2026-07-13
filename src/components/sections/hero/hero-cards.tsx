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

function StatBlock({ data }: { data: StatCardData }) {
  return (
    <div className="flex flex-col gap-2">
      {data.eyebrow && (
        <span className="text-xs text-white/70">{data.eyebrow}</span>
      )}
      <p className="font-sans text-[32px] leading-8 font-bold tracking-tight">
        <span className="text-lavender">{data.value}</span>{" "}
        <span className="text-sm font-medium text-white">
          {data.valueSuffix}
        </span>
      </p>
      <p className="max-w-[90%] text-xs leading-relaxed text-white/60">
        {data.description}
      </p>
    </div>
  );
}

function ScoreBadgeCardContent({ data }: { data: ScoreBadgeCardData }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-3.5">
      <span className="text-sm text-navy">{data.label}</span>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-x-2">
        <div>
          <p className="text-[10px] text-warm-gray">Antes</p>
          <p className="text-sm font-semibold text-navy">{data.before}</p>
        </div>
        <span className="pb-0.5 text-gold">→</span>
        <div>
          <p className="text-[10px] text-warm-gray">Depois</p>
          <p className="text-sm font-semibold text-navy">{data.after}</p>
        </div>
      </div>
      <span className="inline-flex w-fit items-center gap-1 text-xs font-medium text-gold">
        <span className="size-1.5 rounded-full bg-gold" />
        {data.delta}
      </span>
    </div>
  );
}

function TestimonialCardContent({ data }: { data: TestimonialCardData }) {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
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

function HeroCardsMobile() {
  return (
    <div className="flex flex-col gap-4 lg:hidden">
      <GlassCard tint="bg-navy/70" className="hero-card">
        <div className="p-5">
          <StatBlock data={statPrimary} />
        </div>
      </GlassCard>
      <GlassCard tint="bg-navy/70" className="hero-card">
        <div className="p-5">
          <StatBlock data={statSecondary} />
        </div>
      </GlassCard>
      <div className="hero-card rounded-2xl bg-white">
        <ScoreBadgeCardContent data={scoreBadge} />
      </div>
      <GlassCard tint="bg-navy/70" className="hero-card">
        <TestimonialCardContent data={testimonial} />
      </GlassCard>
    </div>
  );
}

function HeroCardsDesktop() {
  return (
    <div
      className="relative hidden w-full max-w-95 lg:block"
      style={{ aspectRatio: "379 / 422" }}
    >
      {/* Combined stat panel — traces public/images/hero-section/glass-card.svg
          (a wide top card fused with a narrower bottom-left card). The svg
          carries its own fill + gradient stroke; backdrop-blur is applied
          here so it actually blurs the busy background behind it. */}
      <div
        className="hero-card absolute left-0 top-0 w-full"
        style={{ aspectRatio: "380 / 280" }}
      >
        <Image
          src="/images/hero-section/glass-card.svg"
          alt=""
          fill
          className="pointer-events-none backdrop-blur-[17.5px]"
        />
        <div className="absolute inset-x-0 top-0 p-4" style={{ height: "54.3%" }}>
          <StatBlock data={statPrimary} />
        </div>
        <div
          className="absolute left-0 p-4"
          style={{ width: "54.6%", top: "60%", bottom: 0 }}
        >
          <StatBlock data={statSecondary} />
        </div>
      </div>

      <div
        className="hero-card absolute overflow-hidden rounded-2xl bg-white"
        style={{ left: "57.3%", top: "41.7%", width: "45.9%", height: "24.4%" }}
      >
        <ScoreBadgeCardContent data={scoreBadge} />
      </div>

      <GlassCard
        tint="bg-navy/70"
        className="hero-card absolute left-0 w-full"
        style={{ top: "68.3%", height: "31.7%" }}
      >
        <TestimonialCardContent data={testimonial} />
      </GlassCard>
    </div>
  );
}

function HeroCards() {
  return (
    <>
      <HeroCardsMobile />
      <HeroCardsDesktop />
    </>
  );
}

export { HeroCards };
