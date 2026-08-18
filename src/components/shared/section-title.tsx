import { cn } from "@/lib/utils";

function SectionTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "font-heading text-[40px] leading-[61.6px] font-normal text-navy",
        className
      )}
      {...props}
    />
  );
}

export { SectionTitle };
