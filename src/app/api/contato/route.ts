import { NextResponse } from "next/server";
import { z } from "zod";
import { sendLeadWhatsAppNotification } from "@/lib/whatsapp";
import { sendLeadEmailNotification } from "@/lib/email";
import { createMeetingEvent, fetchAvailableSlots, SlotTakenError } from "@/lib/google-calendar";
import { AVAILABILITY, validateSlot } from "@/lib/availability";
import { isRateLimited } from "@/lib/rate-limit";

const leadSchema = z.object({
  nome: z.string().trim().min(1).max(120),
  cargo: z.string().trim().min(1).max(120),
  empresa: z.string().trim().min(1).max(120),
  setor: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  telefone: z.string().trim().min(6).max(30),
  dor: z.string().trim().min(1).max(2000),
  empresaWebsite: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

const MEETING_DURATION_MINUTES = AVAILABILITY.durationMinutes;
const LUANDA_UTC_OFFSET = AVAILABILITY.utcOffset;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados pedidos. Tente novamente daqui a pouco." },
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const lead = parsed.data;

  // Honeypot filled. A success response is returned so the rejection is not
  // detectable by the submitter.
  if (lead.empresaWebsite) {
    return NextResponse.json({ ok: true });
  }

  // The client cannot be trusted to have applied the rules, and a page left
  // open overnight offers times that have since fallen inside the notice period.
  if (!validateSlot(lead.date, lead.time).ok) {
    return NextResponse.json(
      { ok: false, error: "O horário escolhido não está disponível para marcação." },
      { status: 400 }
    );
  }

  // Occupancy is checked before any channel fires, so a lead is never told the
  // meeting is booked for a time that was already taken. Failing to reach the
  // calendar is not treated as unavailability: email is the primary channel and
  // must not depend on it.
  try {
    const free = await fetchAvailableSlots(lead.date);
    if (!free.includes(lead.time)) {
      return NextResponse.json({ ok: false, error: "SLOT_TAKEN" }, { status: 409 });
    }
  } catch (error) {
    console.error("Availability pre-check failed, proceeding:", error);
  }

  const meetingStart = new Date(`${lead.date}T${lead.time}:00${LUANDA_UTC_OFFSET}`);
  const meetingEnd = new Date(meetingStart.getTime() + MEETING_DURATION_MINUTES * 60_000);
  const meetingLabel = new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Luanda",
  }).format(meetingStart);


  // Settled independently so one unconfigured or failing integration never
  // prevents the others from delivering.
  const [emailResult, whatsappResult, calendarResult] = await Promise.allSettled([
    sendLeadEmailNotification({
      nome: lead.nome,
      cargo: lead.cargo,
      empresa: lead.empresa,
      setor: lead.setor,
      email: lead.email,
      telefone: lead.telefone,
      dor: lead.dor,
      reuniao: meetingLabel,
    }),
    sendLeadWhatsAppNotification({
      nome: lead.nome,
      empresa: lead.empresa,
      contacto: `${lead.email} / ${lead.telefone}`,
      mensagem: lead.dor,
      reuniao: meetingLabel,
    }),
    createMeetingEvent({
      summary: `Diagnóstico Visio Nexum — ${lead.empresa}`,
      description: [
        `Diagnóstico Visio Nexum — ${MEETING_DURATION_MINUTES} minutos.`,
        "",
        `Uma conversa breve para perceber o contexto da ${lead.empresa} e`,
        "identificar onde existe margem de melhoria. Sem apresentação comercial.",
        "",
        "Para remarcar ou cancelar, responda a este convite ou escreva para",
        "geral@visionexum.com.",
      ].join("\n"),
      startISO: meetingStart.toISOString(),
      endISO: meetingEnd.toISOString(),
      attendeeEmail: lead.email,
    }),
  ]);

  if (emailResult.status === "rejected") {
    console.error("Email lead notification failed:", emailResult.reason);
  }
  if (whatsappResult.status === "rejected") {
    console.error("WhatsApp lead notification failed:", whatsappResult.reason);
  }
  if (calendarResult.status === "rejected") {
    console.error("Google Calendar event creation failed:", calendarResult.reason);
  }

  // The slot was taken in the moments between the check above and the booking.
  // The other channels have already delivered, so the lead is not lost, but the
  // meeting was not made and the submitter has to be told.
  if (calendarResult.status === "rejected" && calendarResult.reason instanceof SlotTakenError) {
    return NextResponse.json({ ok: false, error: "SLOT_TAKEN" }, { status: 409 });
  }
  // Last resort: with every channel unavailable the submission would
  // otherwise be lost, so the payload is written to the server log.
  const delivered = [emailResult, whatsappResult, calendarResult].some(
    (result) => result.status === "fulfilled"
  );
  if (!delivered) {
    console.error("Lead fallback — no integration configured:", {
      ...lead,
      empresaWebsite: undefined,
      meetingLabel,
    });
  }

  return NextResponse.json({
    ok: true,
    email: emailResult.status === "fulfilled",
    whatsapp: whatsappResult.status === "fulfilled",
    calendar: calendarResult.status === "fulfilled",
  });
}
