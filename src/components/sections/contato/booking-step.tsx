"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CircleCheckIcon } from "lucide-react";
import { pt } from "date-fns/locale";
import { format } from "date-fns";
import { ArrowUpRight } from "@/components/shared/icons";
import { AVAILABILITY, earliestDay, latestDay } from "@/lib/availability";

/** Parses yyyy-MM-dd into a local midnight, which is what react-day-picker compares against. */
function toLocalDay(dateISO: string) {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function BookingStep({
  date,
  onDateChange,
  selectedTime,
  onTimeChange,
  onBack,
  onConfirm,
  isSubmitting = false,
}: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedTime: string | null;
  onTimeChange: (time: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}) {
  // Held together with the day it belongs to, so a result arriving after the
  // day has changed is ignored rather than shown against the wrong date.
  const [lookup, setLookup] = useState<{ date: string; slots: string[] } | null>(null);

  // Weekends, the notice period and the horizon are known without asking the
  // server, so the month renders correctly on first paint.
  const bounds = useMemo(
    () => ({ first: toLocalDay(earliestDay()), last: toLocalDay(latestDay()) }),
    []
  );

  const dateISO = date ? format(date, "yyyy-MM-dd") : null;

  // Which of the allowed slots are still free depends on the calendar, so it is
  // fetched per day. The response is discarded if the day changes mid-flight.
  useEffect(() => {
    if (!dateISO) return;

    let active = true;
    fetch(`/api/disponibilidade?date=${dateISO}`)
      .then((response) => response.json())
      .then((result: { slots?: string[] }) => {
        if (active) setLookup({ date: dateISO, slots: result.slots ?? [] });
      })
      .catch(() => {
        if (active) setLookup({ date: dateISO, slots: [] });
      });

    return () => {
      active = false;
    };
  }, [dateISO]);

  const slots = lookup && lookup.date === dateISO ? lookup.slots : null;
  const isLoadingSlots = dateISO !== null && slots === null;

  return (
    <div className="flex h-full flex-col">
      <Card className="gap-0 p-0 shadow-none">
        <CardHeader className="flex h-max justify-center border-b p-4!">
          <CardTitle className="font-heading text-lg font-normal text-navy">
            Escolha o dia e a hora
          </CardTitle>
        </CardHeader>
        <CardContent className="relative p-0 md:pr-48">
          <div className="p-6 max-sm:flex max-sm:justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              defaultMonth={date ?? bounds.first}
              startMonth={bounds.first}
              endMonth={bounds.last}
              disabled={[
                { before: bounds.first },
                { after: bounds.last },
                { dayOfWeek: [0, 6] },
              ]}
              showOutsideDays={false}
              locale={pt}
              className="bg-transparent p-0 [--cell-size:--spacing(10)]"
            />
          </div>
          <div className="inset-y-0 right-0 flex w-full flex-col gap-4 border-t max-md:h-60 md:absolute md:w-48 md:border-t-0 md:border-l">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-2 p-6">
                {!date ? (
                  <p className="font-sans text-sm text-navy/50">
                    Escolha primeiro um dia.
                  </p>
                ) : isLoadingSlots ? (
                  <p className="font-sans text-sm text-navy/50">
                    A verificar disponibilidade…
                  </p>
                ) : slots && slots.length > 0 ? (
                  slots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => onTimeChange(time)}
                      className="w-full shadow-none"
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <p className="font-sans text-sm text-navy/50">
                    Sem horários disponíveis neste dia. Escolha outro.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t px-6 py-5! md:flex-row">
          <div className="flex items-center gap-2 text-sm text-navy/70">
            {date && selectedTime ? (
              <>
                <CircleCheckIcon className="size-5 shrink-0 stroke-score-positive" />
                <span>
                  Reunião marcada para{" "}
                  <span className="font-medium text-navy">
                    {date.toLocaleDateString("pt-PT", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>{" "}
                  às{" "}
                  <span className="font-medium text-navy">{selectedTime}</span>,
                  durante {AVAILABILITY.durationMinutes} minutos.
                </span>
              </>
            ) : (
              <>Selecione um dia e uma hora para a reunião. Horas de Luanda.</>
            )}
          </div>
        </CardFooter>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="font-sans text-sm font-medium text-navy/60 transition-colors hover:text-navy"
        >
          ← Voltar
        </button>
        <Button
          type="button"
          variant="default"
          size="pill"
          disabled={!date || !selectedTime || isSubmitting}
          onClick={onConfirm}
        >
          {isSubmitting ? (
            "A enviar…"
          ) : (
            <>
              Confirmar reunião <ArrowUpRight className="size-3" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export { BookingStep };
