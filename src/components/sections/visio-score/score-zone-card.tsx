import type { ScoreZoneData } from "@/data/visio-score";

// Neutral editorial tile: range + label at the top, description anchored to
// the bottom so a row of tiles reads cleanly however long the copy runs.
function ScoreZoneCard({ data }: { data: ScoreZoneData }) {
  return (
    <div className="score-zone-card flex min-h-[240px] flex-col justify-between rounded-[20px] bg-cream-light p-6">
      <div>
        <span className="font-heading text-[40px] leading-none font-normal text-navy">
          {data.range}
        </span>
        <p className="mt-3 font-sans text-[18px] leading-6 font-medium text-navy">
          {data.label}
        </p>
      </div>
      <p className="mt-6 font-sans text-[13px] leading-5 text-navy/60">
        {data.description}
      </p>
    </div>
  );
}

export { ScoreZoneCard };
