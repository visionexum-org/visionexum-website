export type MethodPhaseData = {
  phase: string;
  title: string;
  description: string;
  duration: string;
  deliverables: string;
  /** Phase 3 is recurring rather than fixed-length, so it reports cadence and
      contract instead of a duration and a deliverable. Default to the usual
      pair when a phase does not override them. */
  durationLabel?: string;
  deliverablesLabel?: string;
};

export const methodPhases: MethodPhaseData[] = [
  {
    phase: "Fase 1",
    title: "Diagnóstico de percepção",
    description:
      "Análise rigorosa da situação actual da empresa nas 4 dimensões de percepção — interna, externa, digital e competitiva. Cálculo do Visio Score™ com evidência verificável. Identificação dos gaps com maior custo para o negócio. O diagnóstico não é um relatório — é o mapa que torna a fundação inevitável.",
    duration: "4 semanas",
    deliverables: "Relatório + Visio Score™ + Roadmap",
    deliverablesLabel: "Entregável",
  },
  {
    phase: "Fase 2",
    title: "Fundação estratégica",
    description:
      "Construção das 5 camadas de percepção — do propósito ao sistema de activação. É o trabalho mais profundo e mais valioso que fazemos. No final, a empresa recebe 3 documentos-mestre que se tornam activos permanentes: o Livro de Percepção™, o Manual de Narrativas™ e o Guia de Activação™.",
    duration: "8 semanas",
    deliverables: "3 documentos-mestre permanentes",
  },
  {
    phase: "Fase 3",
    title: "Orquestração estratégica",
    description:
      "A percepção não é estática. O mercado muda, os concorrentes movem-se, a empresa evolui. A orquestração garante que o que foi construído se mantém coerente, evolui com inteligência e cria valor crescente. Sessões mensais, scorecard trimestral e revisão anual com novo diagnóstico comparativo.",
    duration: "Mensal · Trimestral · Anual",
    durationLabel: "Ritmo",
    deliverables: "Mínimo 12 meses",
    deliverablesLabel: "Contrato",
  },
];
