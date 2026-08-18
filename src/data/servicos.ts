export type ServiceIcon = "info" | "search" | "layers" | "loader";

export type ServiceHowItWorksItem = {
  number: string;
  title: string;
  description: string;
};

export type ServiceStepData = {
  /** Vertical label in the cream tab, e.g. "Degrau-0". */
  tab: string;
  /** Horizontal label at the top of the expanded card, e.g. "Degrau 0 - Entrada". */
  badge: string;
  /** Big number in the top staircase, e.g. "00". */
  number: string;
  title: string;
  icon: ServiceIcon;
  summary: string;
  receives: string[];
  howItWorks: ServiceHowItWorksItem[];
};

// MOCK — conteúdo placeholder do cliente; só o Degrau 0 tem o detalhe final.
export const serviceSteps: ServiceStepData[] = [
  {
    tab: "Degrau-0",
    badge: "Degrau 0 - Entrada",
    number: "00",
    title: "Sessão de Clareza™",
    icon: "info",
    summary:
      "Meio dia que revela o que a empresa parece ser — e o que devia ser.",
    receives: [
      "Visio Flash Report™ (2 páginas)",
      "Score preliminar nas 4 dimensões",
      "Gap crítico identificado com custo estimado",
      "3 recomendações imediatas",
      "Opções de continuidade claras",
    ],
    howItWorks: [
      {
        number: "01",
        title: "Calibração",
        description:
          "exercício de mapeamento com a liderança: cada participante descreve a empresa em 3 palavras. As divergências revelam o gap.",
      },
      {
        number: "02",
        title: "Diagnóstico flash",
        description:
          "avaliação rápida das 4 dimensões com score preliminar calculado ao vivo.",
      },
      {
        number: "03",
        title: "Entrega",
        description:
          "Visio Flash Report™ com score, gap crítico e roadmap de próximos passos.",
      },
    ],
  },
  {
    tab: "Degrau-1",
    badge: "Degrau 1 - Diagnóstico",
    number: "01",
    title: "Diagnóstico de Percepção",
    icon: "search",
    summary:
      "Meio dia que revela o que a empresa parece ser — e o que devia ser.",
    receives: [
      "Relatório completo das 4 dimensões",
      "Visio Score auditado e documentado",
      "Mapa de gaps por ponto de contacto",
      "Benchmark face à concorrência directa",
      "Roadmap priorizado por impacto",
    ],
    howItWorks: [
      {
        number: "01",
        title: "Recolha",
        description:
          "auditoria dos sinais internos e externos: website, canais, discurso da liderança e experiência do cliente.",
      },
      {
        number: "02",
        title: "Avaliação",
        description:
          "cada critério é pontuado com evidência — não opinião — para um score defensável.",
      },
      {
        number: "03",
        title: "Entrega",
        description:
          "relatório com score, gaps priorizados e o custo de percepção estimado.",
      },
    ],
  },
  {
    tab: "Degrau-2",
    badge: "Degrau 2 - Fundação",
    number: "02",
    title: "Fundação Estratégica",
    icon: "layers",
    summary:
      "Meio dia que revela o que a empresa parece ser — e o que devia ser.",
    receives: [
      "Território de percepção definido",
      "Narrativa central e mensagens-chave",
      "Sistema de coerência por canal",
      "Guia de aplicação para a equipa",
      "Métricas de acompanhamento",
    ],
    howItWorks: [
      {
        number: "01",
        title: "Arquitectura",
        description:
          "construção do território único e da narrativa que o mercado deve passar a reconhecer.",
      },
      {
        number: "02",
        title: "Sistema",
        description:
          "tradução da narrativa em regras de coerência aplicáveis a cada ponto de contacto.",
      },
      {
        number: "03",
        title: "Activação",
        description:
          "entrega documentada e sessão de alinhamento com a liderança e a equipa.",
      },
    ],
  },
  {
    tab: "Degrau-3",
    badge: "Degrau 3 - Orquestração",
    number: "03",
    title: "Orquestração Estratégica",
    icon: "loader",
    summary:
      "Meio dia que revela o que a empresa parece ser — e o que devia ser.",
    receives: [
      "Gestão contínua da percepção",
      "Revisão trimestral do Visio Score",
      "Ajuste da narrativa à evolução",
      "Acompanhamento por ponto de contacto",
      "Relatório de progresso recorrente",
    ],
    howItWorks: [
      {
        number: "01",
        title: "Monitorização",
        description:
          "acompanhamento do score e dos sinais de percepção ao longo do tempo.",
      },
      {
        number: "02",
        title: "Optimização",
        description:
          "ajustes contínuos para manter a coerência à medida que a empresa evolui.",
      },
      {
        number: "03",
        title: "Reporte",
        description:
          "relatório recorrente com evolução do score e próximas prioridades.",
      },
    ],
  },
];
