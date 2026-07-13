import Image from "next/image";

function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 hero-bg">
      <Image
        src="/images/hero-section/bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/70 via-navy/10 to-transparent" />
    </div>
  );
}

export { HeroBackground };
