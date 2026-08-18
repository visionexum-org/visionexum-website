import Image from "next/image";

function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 hero-bg">
      <Image
        src="/images/hero-section/heronewbg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}

export { HeroBackground };
