"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type LeadFormState = {
  nome: string;
  cargo: string;
  empresa: string;
  setor: string;
  email: string;
  telefone: string;
  dor: string;
  // Honeypot: left empty by real users, invisible on screen but still
  // present in the DOM/tab order for naive bots that auto-fill every
  // field. A non-empty value here means the submission is discarded
  // server-side — see the /api/contato route.
  empresaWebsite: string;
};

export const initialLeadState: LeadFormState = {
  nome: "",
  cargo: "",
  empresa: "",
  setor: "",
  email: "",
  telefone: "",
  dor: "",
  empresaWebsite: "",
};

const fieldClassName =
  "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-sans text-sm text-navy placeholder:text-navy/35 transition-colors outline-none focus:border-gold focus:ring-4 focus:ring-gold/15";

function Field({
  label,
  name,
  value,
  onChange,
  as = "input",
  ...rest
}: {
  label: string;
  name: keyof LeadFormState;
  value: string;
  onChange: (name: keyof LeadFormState, value: string) => void;
  as?: "input" | "textarea";
} & Omit<React.ComponentProps<"input">, "name" | "value" | "onChange">) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block font-sans text-sm font-medium text-navy/70"
      >
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          rows={4}
          required
          className={cn(fieldClassName, "resize-none")}
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          required
          className={fieldClassName}
          {...rest}
        />
      )}
    </div>
  );
}

function LeadStep({
  initialValues,
  onSubmit,
}: {
  initialValues: LeadFormState;
  onSubmit: (data: LeadFormState) => void;
}) {
  const [data, setData] = useState<LeadFormState>(initialValues);

  const handleChange = (name: keyof LeadFormState, value: string) => {
    setData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex h-full flex-col">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Nome"
          name="nome"
          value={data.nome}
          onChange={handleChange}
          placeholder="O seu nome"
          autoComplete="name"
        />
        <Field
          label="Cargo"
          name="cargo"
          value={data.cargo}
          onChange={handleChange}
          placeholder="Ex: CEO, CMO"
        />
        <Field
          label="Empresa"
          name="empresa"
          value={data.empresa}
          onChange={handleChange}
          placeholder="Nome da empresa"
          autoComplete="organization"
        />
        <Field
          label="Setor"
          name="setor"
          value={data.setor}
          onChange={handleChange}
          placeholder="Ex: Retalho, SaaS, Saúde"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={data.email}
          onChange={handleChange}
          placeholder="o.seu@email.com"
          autoComplete="email"
        />
        <Field
          label="Telefone"
          name="telefone"
          type="tel"
          value={data.telefone}
          onChange={handleChange}
          placeholder="+244 900 000 000"
          autoComplete="tel"
        />
      </div>

      {/* Honeypot — see the LeadFormState.empresaWebsite comment. */}
      <input
        type="text"
        name="empresaWebsite"
        value={data.empresaWebsite}
        onChange={(e) => handleChange("empresaWebsite", e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute size-0 overflow-hidden opacity-0"
      />

      <div className="mt-5">
        <Field
          label="Qual é a maior dor do seu negócio hoje?"
          name="dor"
          value={data.dor}
          onChange={handleChange}
          as="textarea"
          placeholder="Conte-nos, em poucas linhas, o que mais o preocupa agora."
        />
      </div>

      <Button
        type="submit"
        variant="default"
        size="pill"
        className="mt-8 self-start"
      >
        Continuar para agendamento ↗
      </Button>
    </form>
  );
}

export { LeadStep };
