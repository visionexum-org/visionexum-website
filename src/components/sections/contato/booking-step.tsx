"use client";

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

const timeSlots = Array.from({ length: 33 }, (_, i) => {
  const totalMinutes = i * 15;
  const hour = Math.floor(totalMinutes / 60) + 9;
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
              defaultMonth={date}
              disabled={{ before: today }}
              showOutsideDays={false}
              locale={pt}
              className="bg-transparent p-0 [--cell-size:--spacing(10)]"
            />
          </div>
          <div className="inset-y-0 right-0 flex w-full flex-col gap-4 border-t max-md:h-60 md:absolute md:w-48 md:border-t-0 md:border-l">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-2 p-6">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => onTimeChange(time)}
                    className="w-full shadow-none"
                  >
                    {time}
                  </Button>
                ))}
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
                  <span className="font-medium text-navy">{selectedTime}</span>
                  .
                </span>
              </>
            ) : (
              <>Selecione um dia e uma hora para a reunião.</>
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
          {isSubmitting ? "A enviar…" : "Confirmar reunião ↗"}
        </Button>
      </div>
    </div>
  );
}

export { BookingStep };
