// Lead notification by email, sent through Resend's REST API. No SDK is
// required, so this adds no dependency.
//
// The sending domain should be a subdomain such as send.visionexum.com rather
// than the root: the root carries the MX and SPF records for the company's
// mailboxes, and verifying a subdomain keeps the two sets of records apart.

type SendLeadEmailParams = {
  nome: string;
  cargo: string;
  empresa: string;
  setor: string;
  email: string;
  telefone: string;
  dor: string;
  reuniao: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(params: SendLeadEmailParams) {
  const rows: [string, string][] = [
    ["Nome", params.nome],
    ["Cargo", params.cargo],
    ["Empresa", params.empresa],
    ["Sector", params.setor],
    ["E-mail", params.email],
    ["Telefone", params.telefone],
    ["Reunião", params.reuniao],
  ];

  const cells = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap">${label}</td>` +
        `<td style="padding:6px 0;color:#001f35;font-size:14px;font-weight:600">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#b8975a;font-weight:700">Visio Nexum</p>
<h1 style="margin:0 0 20px;font-size:20px;color:#001f35">Novo pedido de diagnóstico</h1>
<table style="border-collapse:collapse;margin-bottom:20px">${cells}</table>
<p style="margin:0 0 6px;color:#6b7280;font-size:13px">Desafio apresentado</p>
<p style="margin:0;padding:12px 14px;background:#f5f2ec;border-radius:6px;color:#001f35;font-size:14px;line-height:1.55;white-space:pre-wrap">${escapeHtml(params.dor)}</p>
</div>`;
}

function buildText(params: SendLeadEmailParams) {
  return [
    "Novo pedido de diagnóstico — Visio Nexum",
    "",
    `Nome: ${params.nome}`,
    `Cargo: ${params.cargo}`,
    `Empresa: ${params.empresa}`,
    `Sector: ${params.setor}`,
    `E-mail: ${params.email}`,
    `Telefone: ${params.telefone}`,
    `Reunião: ${params.reuniao}`,
    "",
    "Desafio apresentado:",
    params.dor,
  ].join("\n");
}

async function sendLeadEmailNotification(params: SendLeadEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFICATION_FROM;
  const to = process.env.LEAD_NOTIFICATION_TO;

  if (!apiKey || !from || !to) {
    throw new Error(
      "Email notification not configured — set RESEND_API_KEY, LEAD_NOTIFICATION_FROM and LEAD_NOTIFICATION_TO."
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      // Replying to the notification reaches the lead directly.
      reply_to: params.email,
      subject: `Novo lead: ${params.empresa} — ${params.nome}`,
      html: buildHtml(params),
      text: buildText(params),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error (${response.status}): ${body}`);
  }
}

export { sendLeadEmailNotification };
