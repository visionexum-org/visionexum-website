import { cn } from "@/lib/utils";

// This must live on its own childless layer. CSS `mask` clips an element's
// entire rendered subtree (not just its own background), so masking the
// wrapper that contains the actual card content would clip the content too.
const gradientBorderMask: React.CSSProperties = {
  WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  WebkitMaskClip: "border-box, content-box",
  WebkitMaskComposite: "xor",
  maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
  maskClip: "border-box, content-box",
  maskComposite: "exclude",
};

// A flat fill in place of a backdrop-filter. backdrop-filter samples what is
// painted behind the element, so the card could not resolve until the hero
// photograph had decoded, which is what produced the unblurred frame on first
// paint. Painting the card's own background removes that dependency, and a
// scrim at this strength carries the white text over any part of the image.
const CARD_FILL = "rgba(0, 0, 0, 0.6)";

function GlassCard({
  className,
  bordered = true,
  children,
  ...props
}: React.ComponentProps<"div"> & { bordered?: boolean }) {
  return (
    <div className={cn("relative rounded-3xl will-change-transform", className)} {...props}>
      <div className="h-full w-full rounded-3xl" style={{ background: CARD_FILL }}>
        {children}
      </div>
      {bordered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-b from-gold to-transparent p-px"
          style={gradientBorderMask}
        />
      )}
    </div>
  );
}

export { GlassCard };
