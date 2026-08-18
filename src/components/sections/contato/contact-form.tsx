"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import {
  LeadStep,
  initialLeadState,
  type LeadFormState,
} from "@/components/sections/contato/lead-step";
import { BookingStep } from "@/components/sections/contato/booking-step";

type Step = "lead" | "booking" | "success";

function ContactForm() {
  const [step, setStep] = useState<Step>("lead");
  const [lead, setLead] = useState<LeadFormState>(initialLeadState);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const successRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);

  useGSAP(
    () => {
      if (step === "success") {
        gsap.fromTo(
          successRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
        return;
      }

      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }

      gsap.fromTo(
        stepRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    },
    { dependencies: [step] }
  );

  const handleLeadSubmit = (data: LeadFormState) => {
    setLead(data);
    setStep("booking");
  };

  const handleConfirm = async () => {
    if (!date || !selectedTime || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lead,
          date: format(date, "yyyy-MM-dd"),
          time: selectedTime,
        }),
      });

      const result: { ok: boolean; error?: string } = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Não foi possível enviar o pedido.");
      }

      setStep("success");
    } catch {
      setSubmitError(
        "Não foi possível enviar o pedido agora. Tente novamente ou contacte-nos directamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setLead(initialLeadState);
    setDate(undefined);
    setSelectedTime(null);
    setSubmitError(null);
    setStep("lead");
  };

  if (step === "success") {
    return (
      <div
        ref={successRef}
        className="flex h-full flex-col items-start justify-center gap-4"
      >
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-navy text-cream">
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className="font-heading text-2xl font-normal text-navy">
          Reunião pedida com sucesso.
        </h3>
        <p className="max-w-sm font-sans text-sm leading-relaxed text-navy/70">
          Recebemos o seu pedido e vamos confirmar a reunião em breve. Vai
          receber um convite de calendário por email para o horário
          escolhido.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="font-sans text-sm font-medium text-navy underline underline-offset-4 transition-colors hover:text-navy/70"
        >
          Enviar outro pedido
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center gap-3">
        <span className="font-sans text-xs font-medium tracking-wide text-navy/50 uppercase">
          Passo {step === "lead" ? "1" : "2"} de 2
        </span>
        <div className="flex flex-1 gap-1.5">
          <span className="h-1 flex-1 rounded-full bg-navy" />
          <span
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step === "booking" ? "bg-navy" : "bg-navy/15"
            )}
          />
        </div>
      </div>

      <div ref={stepRef} className="flex flex-1 flex-col">
        {step === "lead" ? (
          <LeadStep initialValues={lead} onSubmit={handleLeadSubmit} />
        ) : (
          <>
            <BookingStep
              date={date}
              onDateChange={setDate}
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
              onBack={() => setStep("lead")}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
            />
            {submitError && (
              <p className="mt-3 font-sans text-sm text-score-risk">{submitError}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { ContactForm };
