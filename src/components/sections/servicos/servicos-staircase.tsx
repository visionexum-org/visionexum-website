import { serviceSteps } from "@/data/servicos";

// Ascending step heights (px) — mirrors the reference's ~40px-per-step rise.
const BAR_HEIGHTS = [92, 132, 172, 212];

function ServicosStaircase() {
  return (
    <div
      aria-hidden="true"
      className="flex h-[248px] items-end select-none"
    >
      {serviceSteps.map((step, index) => (
        <div
          key={step.number}
          className="flex h-full min-w-0 flex-1 flex-col justify-end"
        >
          <span className="staircase-label mb-2.5 pr-2 font-sans text-[13px] leading-tight text-navy/80">
            {step.title}
          </span>
          <div
            className="staircase-bar flex w-full items-end justify-center bg-gradient-to-b from-[#CDE8FB] to-[#F4FAFE]"
            style={{ height: BAR_HEIGHTS[index], transformOrigin: "bottom" }}
          >
            <span className="staircase-number font-heading pb-3 text-4xl font-bold text-navy">
              {step.number}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export { ServicosStaircase };
