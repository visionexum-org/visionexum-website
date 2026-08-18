import Image from "next/image";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ScoreDimensionData } from "@/data/visio-score";

// Intrinsic viewBox dimensions of each decorative illustration — next/image
// needs the real aspect ratio so `h-[…] w-auto` keeps the art undistorted as
// it bleeds off the card's right edge.
const ILLUSTRATION_DIMS: Record<string, { w: number; h: number }> = {
  "/images/visio-score/dim-1.svg": { w: 522, h: 487 },
  "/images/visio-score/dim-2.svg": { w: 360, h: 401 },
  "/images/visio-score/dim-3.svg": { w: 429, h: 428 },
  "/images/visio-score/dim-4.svg": { w: 390, h: 390 },
};

function DimensionCard({ data }: { data: ScoreDimensionData }) {
  const dims = ILLUSTRATION_DIMS[data.illustration] ?? { w: 500, h: 500 };

  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-[24px] p-8 lg:aspect-[793/487] lg:p-10 lg:pt-[54px]",
        data.cardClass
      )}
    >
      <Image
        src={data.illustration}
        alt=""
        aria-hidden="true"
        width={dims.w}
        height={dims.h}
        unoptimized
        className={cn(
          "pointer-events-none absolute w-auto max-w-none opacity-45 select-none lg:opacity-100",
          data.illustrationClass
        )}
      />

      {/* 16px between every text block (title, description, each criterion). */}
      <div className="relative flex max-w-[66%] flex-col gap-4 lg:max-w-[58%]">
        <h3 className="font-sans text-[24px] leading-[31px] font-medium text-navy">
          {data.title}
        </h3>
        <p className="font-sans text-[12px] leading-[16px] font-normal text-navy/50">
          {data.description}
        </p>

        <ul className="flex flex-col gap-4">
          {data.criteria.map((criterion) => (
            <li
              key={criterion}
              className="flex items-center gap-3 font-sans text-[12px] leading-[16px] font-normal text-navy"
            >
              <Play className="size-2.5 shrink-0 fill-navy text-navy" />
              {criterion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export { DimensionCard };
