import { cn } from "@/lib/utils";

// Reference mockups (1440px canvas) use ~182px side margins, not 96px —
// content sits at ~1076px, not 1248px. Site-wide at lg+ so wider viewports
// (design target: 1920px) get real breathing room instead of the 1440px
// cap simply being stretched to fill more of the available width.
function SectionContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-360 px-6 lg:px-45.5", className)}
      {...props}
    />
  );
}

export { SectionContainer };
