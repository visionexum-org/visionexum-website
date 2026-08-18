export type FaqItemData = {
  question: string;
  answer: string;
};

// MOCK — conteúdo placeholder, a substituir por conteúdo real do cliente.
export const faqItems: FaqItemData[] = [
  {
    question:
      "Qual é a diferença entre a Visio Nexum e uma agência de branding?",
    answer:
      "Uma agência de branding executa — cria materiais, campanhas, conteúdo. A Visio Nexum trabalha na camada anterior: a arquitectura que define o que a agência vai comunicar. Sem essa fundação, a execução mais brilhante tem retorno reduzido. Somos complementares às agências — não concorrentes.",
  },
  {
    question: "Quanto tempo demora até vermos resultados?",
    answer:
      "O diagnóstico inicial (Visio Score) demora poucas semanas. A consolidação da percepção é um processo contínuo — as primeiras mudanças mensuráveis surgem tipicamente entre 60 a 90 dias após o início da orquestração.",
  },
  {
    question: "Trabalham com empresas de qualquer dimensão?",
    answer:
      "Trabalhamos sobretudo com PMEs em fase de crescimento, onde a percepção do mercado já é um travão real ao negócio — quer isso signifique pressão de preço, dificuldade de retenção de talento ou churn silencioso de clientes.",
  },
  {
    question: "O que é exactamente o Visio Score?",
    answer:
      "É o instrumento de medição proprietário da Visio Nexum. Calcula a coerência e solidez de percepção de uma empresa em 4 dimensões, com 20 critérios verificáveis — não opiniões, evidência.",
  },
  {
    question: "Depois do diagnóstico, como funciona o acompanhamento?",
    answer:
      "Definimos um plano de orquestração contínua com marcos trimestrais, revisitando o Visio Score em cada ciclo para garantir que a evolução da percepção acompanha o crescimento do negócio.",
  },
];
