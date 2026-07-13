import { cn } from "@/lib/utils";

function GlassCard({
  className,
  tint = "bg-white/[0.06]",
  children,
  ...props
}: React.ComponentProps<"div"> & { tint?: string }) {
  return (
    <div
      className={cn(
        "rounded-[calc(var(--radius-3xl)+1px)] bg-gradient-to-br from-gold/60 via-gold/10 to-transparent p-px",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full rounded-3xl backdrop-blur-xl",
          tint
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { GlassCard };
