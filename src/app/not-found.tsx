import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-navy px-6 text-center">
      <p className="font-heading text-sm tracking-[0.3em] text-gold uppercase">
        404
      </p>
      <h1 className="font-heading text-3xl font-normal text-white sm:text-4xl">
        Página não encontrada
      </h1>
      <p className="max-w-md font-sans text-sm text-white/70 sm:text-base">
        A página que procura não existe ou foi movida.
      </p>
      <ButtonLink href="/" variant="pillSolid" size="pill" className="mt-2">
        Voltar ao início
      </ButtonLink>
    </main>
  );
}
