import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import {
  controlador,
  ultimaActualizacao,
  PRAZO_CONSERVACAO_ANOS,
} from "@/data/privacidade";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Visio Nexum recolhe, utiliza e protege os dados pessoais submetidos através do pedido de diagnóstico, nos termos da Lei n.º 22/11 de Angola.",
  alternates: { canonical: "/privacidade" },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-normal text-white sm:text-2xl">
        {title}
      </h2>
      <div className="flex flex-col gap-4 font-sans text-sm leading-relaxed text-white/75 sm:text-base">
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-gold">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-navy">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8">
        <Link href="/" aria-label="Visio Nexum — Início">
          <Logo className="h-6 w-auto text-white" />
        </Link>
        <Link
          href="/"
          className="font-sans text-sm text-white/70 transition-colors hover:text-white"
        >
          Voltar ao início
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-4 font-sans text-sm text-white/60">
          Última actualização: {ultimaActualizacao}
        </p>

        <div className="mt-12 flex flex-col gap-10">
          <Section title="1. Quem trata os seus dados">
            <p>
              Esta política explica como a Visio Nexum recolhe, utiliza e
              protege os dados pessoais que nos confia através deste site. O
              responsável pelo tratamento é:
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
              <dl className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-white/50">Denominação:</dt>
                  <dd>{controlador.denominacao}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-white/50">NIF:</dt>
                  <dd>{controlador.nif}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-white/50">Morada:</dt>
                  <dd>{controlador.morada}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-white/50">E-mail:</dt>
                  <dd>{controlador.emailPrivacidade}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-white/50">Telefone:</dt>
                  <dd>{controlador.telefone}</dd>
                </div>
              </dl>
            </div>
            <p>
              O tratamento rege-se pela Lei n.º 22/11, de 17 de Junho — Lei da
              Protecção de Dados Pessoais da República de Angola.
            </p>
          </Section>

          <Section title="2. Que dados recolhemos">
            <p>
              <strong className="font-semibold text-white">
                Dados que nos fornece.
              </strong>{" "}
              Ao submeter o pedido de diagnóstico, recolhemos exclusivamente o
              que preenche no formulário:
            </p>
            <List
              items={[
                "Nome e cargo que ocupa",
                "Empresa e sector de actividade",
                "E-mail e telefone de contacto",
                "A descrição do desafio que nos apresenta",
                "A data e hora que escolhe para a reunião",
              ]}
            />
            <p>
              <strong className="font-semibold text-white">
                Dados recolhidos automaticamente.
              </strong>{" "}
              Registamos temporariamente o endereço IP de quem submete o
              formulário, apenas para limitar submissões abusivas, e os registos
              técnicos habituais do servidor que aloja o site.
            </p>
            <p>
              <strong className="font-semibold text-white">
                O que não fazemos.
              </strong>{" "}
              Este site não utiliza cookies, não integra ferramentas de análise
              de tráfego nem tecnologias de rastreio publicitário. Não criamos
              perfis nem tomamos decisões automatizadas sobre si.
            </p>
          </Section>

          <Section title="3. Para que utilizamos os seus dados">
            <List
              items={[
                "Agendar, preparar e realizar a reunião de diagnóstico que solicitou — trata-se de diligências prévias ao contrato, executadas a seu pedido.",
                "Contactá-lo a respeito desse pedido, por e-mail, telefone ou WhatsApp.",
                "Proteger o formulário contra submissões automatizadas e abusivas, no nosso interesse legítimo em manter o serviço operacional.",
              ]}
            />
            <p>
              Não utilizamos os seus dados para lhe enviar comunicações de
              marketing sem que nos dê consentimento expresso e separado para
              esse efeito.
            </p>
          </Section>

          <Section title="4. Com quem partilhamos">
            <p>
              Não vendemos nem cedemos os seus dados. Partilhamo-los apenas com
              os prestadores de serviço estritamente necessários para dar
              seguimento ao seu pedido:
            </p>
            <List
              items={[
                <>
                  <strong className="font-semibold text-white">
                    Meta Platforms
                  </strong>{" "}
                  — através da WhatsApp Business Platform, para nos notificar
                  internamente de que existe um novo pedido de diagnóstico.
                </>,
                <>
                  <strong className="font-semibold text-white">Google</strong> —
                  através do Google Calendar, para criar o evento da reunião e
                  enviar-lhe o respectivo convite.
                </>,
                <>
                  <strong className="font-semibold text-white">Vercel</strong> —
                  fornecedor de alojamento e infra-estrutura do site.
                </>,
              ]}
            />
            <p>
              Poderemos ainda divulgar dados quando tal nos seja legalmente
              exigido por autoridade competente.
            </p>
          </Section>

          <Section title="5. Transferências internacionais">
            <p>
              Os prestadores indicados acima operam servidores fora de Angola, o
              que implica a transferência dos seus dados para o estrangeiro.
              Essas transferências limitam-se ao necessário para as finalidades
              descritas e estão sujeitas ao regime de transferência
              internacional previsto na Lei n.º 22/11, incluindo, quando
              aplicável, a autorização prévia da Agência de Protecção de Dados.
            </p>
          </Section>

          <Section title="6. Durante quanto tempo conservamos">
            <p>
              Conservamos os dados do seu pedido enquanto durar a relação de
              contacto e, depois disso, até {PRAZO_CONSERVACAO_ANOS} anos, prazo
              que nos permite responder a obrigações legais e a eventuais
              reclamações. Findo esse período, os dados são eliminados. Pode
              pedir a eliminação antecipada a qualquer momento, salvo se formos
              obrigados por lei a conservá-los.
            </p>
          </Section>

          <Section title="7. Os seus direitos">
            <p>
              Nos termos da Lei n.º 22/11, assistem-lhe os direitos de acesso,
              rectificação, actualização e eliminação dos seus dados, bem como o
              direito de se opor ao tratamento e de retirar o consentimento
              quando este seja o fundamento utilizado.
            </p>
            <p>
              Para exercer qualquer destes direitos, escreva-nos para{" "}
              {controlador.emailPrivacidade}. Responderemos com a maior brevidade
              possível. Caso considere que os seus direitos não foram
              respeitados, pode apresentar reclamação junto da Agência de
              Protecção de Dados (APD) de Angola.
            </p>
          </Section>

          <Section title="8. Segurança">
            <p>
              O site é servido exclusivamente por ligação cifrada (HTTPS) e
              aplica cabeçalhos de segurança que restringem a origem do conteúdo
              carregado e impedem o enquadramento das páginas por terceiros. O
              formulário está protegido contra submissões automatizadas e o
              acesso aos dados recebidos está limitado à equipa que trata do seu
              pedido.
            </p>
            <p>
              Nenhum sistema é totalmente inviolável. Comprometemo-nos, ainda
              assim, a adoptar as medidas técnicas e organizativas adequadas ao
              risco e a comunicar-lhe qualquer incidente que afecte
              significativamente os seus dados.
            </p>
          </Section>

          <Section title="9. Menores">
            <p>
              Este serviço dirige-se a profissionais e a empresas. Não
              recolhemos intencionalmente dados de menores. Se tomarmos
              conhecimento de que recebemos dados de um menor sem a devida
              autorização, eliminá-los-emos.
            </p>
          </Section>

          <Section title="10. Alterações a esta política">
            <p>
              Podemos actualizar esta política sempre que se justifique. A
              versão em vigor é sempre a publicada nesta página, com a data de
              última actualização indicada no topo.
            </p>
          </Section>

          <Section title="11. Contacto">
            <p>
              Para qualquer questão sobre esta política ou sobre o tratamento
              dos seus dados, contacte-nos através de{" "}
              {controlador.emailPrivacidade}.
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-sm text-white/60">
            © {new Date().getFullYear()} Visio Nexum. Todos os direitos
            reservados.
          </p>
          <Link
            href="/"
            className="font-sans text-sm text-white/60 transition-colors hover:text-white"
          >
            Voltar ao início
          </Link>
        </div>
      </footer>
    </div>
  );
}
