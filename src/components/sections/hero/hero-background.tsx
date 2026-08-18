import { getImageProps } from "next/image";

// Art direction rather than one image for both: the desktop photo is 2:1, and
// covering a phone's portrait box with it meant scaling it to ~1.7x the
// viewport width and showing a narrow centre strip of a landscape frame. The
// mobile source is shot portrait, so it covers the same box at ~1.2x and needs
// far less upscaling. <picture> with media queries means only one of the two is
// ever fetched — swapping on a CSS class would download both.
const DESKTOP_SRC = "/images/hero-section/heronewbg.webp";
const MOBILE_SRC = "/images/hero-section/heromobilebg.webp";
const BREAKPOINT = "(min-width: 1024px)";

function HeroBackground() {
  const common = { alt: "", fill: true, priority: true } as const;

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: DESKTOP_SRC, sizes: "110vw" });

  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({ ...common, src: MOBILE_SRC, sizes: "125vw" });

  return (
    <div className="hero-bg absolute inset-0 z-0">
      <picture>
        <source media={BREAKPOINT} srcSet={desktopSrcSet} />
        <source srcSet={mobileSrcSet} />
        <img
          {...rest}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </picture>
    </div>
  );
}

export { HeroBackground };
