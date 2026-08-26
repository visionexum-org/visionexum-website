import { NextResponse } from "next/server";
import { z } from "zod";
import { sendLeadWhatsAppNotification } from "@/lib/whatsapp";
import { sendLeadEmailNotification } from "@/lib/email";
import { createMeetingEvent } from "@/lib/google-calendar";
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

const MEETING_DURATION_MINUTES = 15;
const LUANDA_UTC_OFFSET = "+01:00";

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
        `Nome: ${lead.nome}`,
        `Cargo: ${lead.cargo}`,
        `Setor: ${lead.setor}`,
        `Contacto: ${lead.email} / ${lead.telefone}`,
        `Dor: ${lead.dor}`,
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
