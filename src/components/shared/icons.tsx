// The CTAs used to carry a literal "↗" (U+2197). That codepoint is part of
// Unicode's emoji set, so iOS and Android substitute their colour emoji font
// for it and the button ends up with a glyph that ignores the surrounding
// font, weight and colour. Drawing it keeps the mark vector everywhere.
function ArrowUpRight({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M3 9L9 3M9 3H4.2M9 3v4.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { ArrowUpRight };
