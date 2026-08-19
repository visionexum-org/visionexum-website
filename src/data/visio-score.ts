export type ScoreDimensionData = {
  /** Small eyebrow above the card, e.g. "Dimensão 1 - 25 pts". */
  eyebrow: string;
  title: string;
  description: string;
  criteria: string[];
  /** Decorative illustration bled off the right edge of the card. */
  illustration: string;
  /** Card background gradient (literal so Tailwind's scanner picks it up). */
  cardClass: string;
  /** Per-illustration size/position tuning inside the card. */
  illustrationClass: string;
};

export type ScoreZoneData = {
  range: string;
  label: string;
  description: string;
  /** Tile background, read as a risk indicator from critical to healthy. */
  toneClass: string;
};

export const scoreDimensions: ScoreDimensionData[] = [
  {
    eyebrow: "Dimensão 1 - 25 pts",
    title: "Percepção Interna",
    description:
      "Como a liderança e a equipa percepcionam e comunicam a empresa internamente. A percepção interna é a base — sem ela, nenhuma percepção externa se sustenta.",
    criteria: [
      "Clareza do propósito entre a equipa",
      "Coerência da narrativa entre departamentos",
      "Alinhamento entre valores e comportamento",
      "Capacidade de explicar o diferencial",
      "Consistência da liderança como modelo",
    ],
    illustration: "/images/visio-score/dim-1.svg",
    cardClass: "bg-gradient-to-br from-[#F1EDFB] to-[#E4DDF4]",
    illustrationClass: "right-0 top-1/2 h-[118%] -translate-y-1/2",
  },
  {
    eyebrow: "Dimensão 2 - 25 pts",
    title: "Percepção externa",
    description:
      "Como clientes, parceiros e mercado percepcionam a empresa na realidade. É a dimensão que mais directamente impacta vendas, churn e crescimento.",
    criteria: [
      "Clareza do posicionamento pelo cliente",
      "Coerência entre promessa e experiência",
      "Capacidade de gerar referência espontânea",
      "Diferenciação percebida da concorrência",
      "Consistência em todos os pontos de contacto",
    ],
    illustration: "/images/visio-score/dim-2.svg",
    cardClass: "bg-gradient-to-br from-[#F4F4F4] to-[#E4E4E4]",
    illustrationClass: "-right-4 -bottom-10 h-[92%]",
  },
  {
    eyebrow: "Dimensão 3 - 25 pts",
    title: "Percepção digital",
    description:
      "Coerência e solidez da presença nos canais digitais. É frequentemente a primeira impressão que um potencial cliente tem da empresa.",
    criteria: [
      "Coerência visual e verbal entre canais",
      "Qualidade da narrativa no website",
      "Posicionamento da liderança online",
      "Reputação e visibilidade no sector",
      "Alinhamento do conteúdo com o território",
    ],
    illustration: "/images/visio-score/dim-3.svg",
    cardClass: "bg-gradient-to-br from-[#FEF7E9] to-[#FBEECF]",
    illustrationClass: "right-0 top-1/2 h-[100%] -translate-y-1/2",
  },
  {
    eyebrow: "Dimensão 4 - 25 pts",
    title: "Percepção competitiva",
    description:
      "Posição e diferenciação face ao ecossistema competitivo. Quando fraca, o cliente decide por preço — e toda a gente perde.",
    criteria: [
      "Clareza do território único vs. concorrentes",
      "Capacidade de ser primeira escolha",
      "Resistência à comparação de preço",
      "Coerência sob pressão competitiva",
      "Capacidade de atrair talento pelo posicionamento",
    ],
    illustration: "/images/visio-score/dim-4.svg",
    cardClass: "bg-gradient-to-br from-[#E7F4FE] to-[#D6ECFC]",
    illustrationClass: "right-0 top-1/2 h-[98%] -translate-y-1/2",
  },
];

export const scoreZones: ScoreZoneData[] = [
  {
    range: "0–40",
    label: "Risco activo",
    description:
      "Percepção desconexa com impacto imediato no negócio. Clientes saem sem explicar. Pressão constante de preço. Talento não chega.",
    toneClass: "bg-[#FFE2E2]",
  },
  {
    range: "41–60",
    label: "Percepção frágil",
    description:
      "Base presente mas inconsistente. O mercado percebe o valor por vezes — mas não de forma previsível. O marketing tem retorno reduzido.",
    toneClass: "bg-[#FFECC5]",
  },
  {
    range: "61–80",
    label: "Em consolidação",
    description:
      "Boa base. A percepção é positiva mas ainda não é consistente em todas as dimensões. A orquestração contínua sustenta a evolução.",
    toneClass: "bg-[#FFFCD8]",
  },
  {
    range: "81–100",
    label: "Percepção sólida",
    description:
      "Referência de sector. O mercado percebe, sente e recomenda espontaneamente. Os clientes justificam o preço premium por iniciativa própria.",
    toneClass: "bg-[#D8FFCE]",
  },
];
