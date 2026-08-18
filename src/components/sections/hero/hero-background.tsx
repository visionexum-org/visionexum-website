import Image from "next/image";

function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 hero-bg">
      {/* `sizes` has to describe the width the image is *rendered* at, not the
          width of the box. This is a 2:1 photo filling a portrait box, so
          object-cover scales it to match the box height and it ends up roughly
          1.7x the viewport wide on phones — asking for 100vw there fetched a
          1200px file for a ~1500px render, which is what made it look soft. */}
      <Image
        src="/images/hero-section/heronewbg.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 170vw, 110vw"
        className="object-cover object-[62%_center] lg:object-center"
      />
    </div>
  );
}

export { HeroBackground };
