import Image from "next/image";

function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 hero-bg">
      <Image
        src="/images/hero-section/bg.png"
        alt=""
        fill
        priority
        quality={95}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-b from-navy/25 via-transparent to-navy" />
      <div className="absolute inset-0 bg-linear-to-r from-navy/60 via-navy/5 to-transparent" />
    </div>
  );
}

export { HeroBackground };
