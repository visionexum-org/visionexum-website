"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-navy px-6 text-center">
      <p className="font-heading text-sm tracking-[0.3em] text-gold uppercase">
        Erro
      </p>
      <h1 className="font-heading text-3xl font-normal text-white sm:text-4xl">
        Algo correu mal
      </h1>
      <p className="max-w-md font-sans text-sm text-white/70 sm:text-base">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <Button onClick={reset} variant="pillSolid" size="pill" className="mt-2">
        Tentar novamente
      </Button>
    </main>
  );
}
