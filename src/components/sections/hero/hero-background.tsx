import { getImageProps } from "next/image";

// Art direction: the desktop frame is 2:1 and the mobile frame is portrait.
// Selection happens through <picture> media queries so exactly one asset is
// fetched per viewport.
const DESKTOP_SRC = "/images/hero-section/heronewbg.webp";
const MOBILE_SRC = "/images/hero-section/heromobilebg.webp";
const DESKTOP_MEDIA = "(min-width: 1024px)";

// `sizes` must describe the width the image is rendered at, not the width of
// its container. object-cover scales the asset until it covers the box, which
// on these aspect ratios is consistently wider than the viewport. A <source>
// without an explicit `sizes` falls back to 100vw and under-selects.
const DESKTOP_SIZES = "150vw";
const MOBILE_SIZES = "125vw";

function HeroBackground() {
  const common = { alt: "", fill: true, priority: true } as const;

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: DESKTOP_SRC, sizes: DESKTOP_SIZES });

  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({ ...common, src: MOBILE_SRC, sizes: MOBILE_SIZES });

  return (
    <div className="hero-bg absolute inset-0 z-0">
      <picture>
        <source
          media={DESKTOP_MEDIA}
          srcSet={desktopSrcSet}
          sizes={DESKTOP_SIZES}
        />
        <source srcSet={mobileSrcSet} sizes={MOBILE_SIZES} />
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
