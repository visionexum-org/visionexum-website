export type HeroStatCardData = {
  eyebrow: string;
  statValue: string;
  statSuffix: string;
  description: string;
};

export type HeroScoreCardData = {
  heading: string;
  description: string;
  cta: string;
};

export const heroStat: HeroStatCardData = {
  eyebrow: "Apenas",
  statValue: "1 em 4",
  statSuffix: "PMEs angolanas continua activa hoje.",
  description:
    "As que sobrevivem raramente venceram pelo produto — venceram porque o mercado sabia quem eram, e confiava nisso.",
};

export const heroScore: HeroScoreCardData = {
  heading: "20 sinais → 1 Score → 1 plano",
  description:
    "O Visio Score traduz reconhecimento, confiança e clareza de posicionamento num ponto de partida claro. Sem isso, qualquer campanha é só ruído.",
  cta: "A tua marca já sabe o score dela?",
};
