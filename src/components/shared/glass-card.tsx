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

function GlassCard({
  className,
  tint = "bg-white/[0.06]",
  bordered = true,
  children,
  ...props
}: React.ComponentProps<"div"> & { tint?: string; bordered?: boolean }) {
  return (
    <div className={cn("relative rounded-3xl will-change-transform", className)} {...props}>
      <div
        className={cn("h-full w-full rounded-3xl backdrop-blur-lg", tint)}
        style={{
          willChange: "backdrop-filter",
          transform: "translateZ(0)",
          isolation: "isolate",
        }}
      >
        {children}
      </div>
      {bordered && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-bl from-gold/70 to-transparent p-px"
          style={gradientBorderMask}
        />
      )}
    </div>
  );
}

export { GlassCard };
