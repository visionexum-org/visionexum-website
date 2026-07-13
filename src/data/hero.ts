export type StatCardData = {
  kind: "stat";
  eyebrow: string;
  value: string;
  valueSuffix: string;
  description: string;
};

export type ScoreBadgeCardData = {
  kind: "score-badge";
  label: string;
  before: string;
  after: string;
  delta: string;
};

export type TestimonialCardData = {
  kind: "testimonial";
  avatarSrc: string;
  name: string;
  role: string;
  quote: string;
};

export type HeroCardData =
  | StatCardData
  | ScoreBadgeCardData
  | TestimonialCardData;

export const heroCards: HeroCardData[] = [
  {
    kind: "stat",
    eyebrow: "Aproximadamente",
    value: "1 em 4",
    valueSuffix: "PMEs em Angola",
    description:
      "É quanto das empresas registadas em Angola continua activa hoje. A diferença raramente é o produto — é como o mercado a vê.",
  },
  {
    kind: "stat",
    eyebrow: "",
    value: "0-100",
    valueSuffix: "Visio Score",
    description:
      "Uma escala que transforma \"parece-me melhor\" em algo que se mede, compara e melhora.",
  },
  {
    kind: "score-badge",
    label: "Visio Score",
    before: "45 pts",
    after: "80 pts",
    delta: "+35 pts",
  },
  {
    kind: "testimonial",
    avatarSrc: "/images/hero-section/jeff-bezos.png",
    name: "Jeff Bezos",
    role: "Fundador da Amazon",
    quote:
      "Sua marca é o que as pessoas falam de você quando você não está na sala.",
  },
];
