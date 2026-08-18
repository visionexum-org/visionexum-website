// WhatsApp Cloud API requires a pre-approved template. Submit to Meta:
//   Title: 🔔 Novo lead — Visio Nexum
//   Body:
//   Nome: {{1}}
//   Empresa: {{2}}
//   Contacto: {{3}}
//   Mensagem: {{4}}
//   Reunião: {{5}}

type SendLeadNotificationParams = {
  nome: string;
  empresa: string;
  contacto: string;
  mensagem: string;
  reuniao: string;
};

async function sendLeadWhatsAppNotification(params: SendLeadNotificationParams) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const businessNumber = process.env.WHATSAPP_BUSINESS_NUMBER;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "novo_lead";

  if (!accessToken || !phoneNumberId || !businessNumber) {
    throw new Error(
      "WhatsApp Cloud API not configured — set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_BUSINESS_NUMBER."
    );
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: businessNumber,
        type: "template",
        template: {
          name: templateName,
          language: { code: "pt_PT" },
          components: [
            {
              type: "body",
              parameters: [
                params.nome,
                params.empresa,
                params.contacto,
                params.mensagem,
                params.reuniao,
              ].map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WhatsApp Cloud API error (${response.status}): ${body}`);
  }
}

export { sendLeadWhatsAppNotification };
