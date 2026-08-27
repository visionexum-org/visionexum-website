type CreateMeetingEventParams = {
  summary: string;
  description: string;
  startISO: string;
  endISO: string;
  attendeeEmail: string;
};

// Apps Script cold starts take a few seconds; beyond this the submission is
// reported as delivered through the other channels rather than left hanging.
const REQUEST_TIMEOUT_MS = 15_000;

/** Raised when the chosen slot was taken between the page loading and submitting. */
class SlotTakenError extends Error {
  constructor() {
    super("O horário escolhido já não está disponível.");
    this.name = "SlotTakenError";
  }
}

function endpoint() {
  const url = process.env.GOOGLE_CALENDAR_WEBAPP_URL;
  const secret = process.env.GOOGLE_CALENDAR_WEBAPP_SECRET;

  if (!url || !secret) {
    throw new Error(
      "Google Calendar not configured — set GOOGLE_CALENDAR_WEBAPP_URL and GOOGLE_CALENDAR_WEBAPP_SECRET."
    );
  }
  return { url, secret };
}

/**
 * Calls the Apps Script Web App (source in scripts/calendar-webapp.gs). The
 * script runs as the account that owns the calendar, so invitations are sent
 * normally; a Cloud service account cannot invite attendees without
 * domain-wide delegation. The deployment is unauthenticated by necessity, so
 * the shared secret authorises the call.
 */
async function callEndpoint(payload: Record<string, unknown>) {
  const { url, secret } = endpoint();

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, ...payload }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // The deployment answers 200 and reports its own outcome in the body, so the
  // transport status alone does not indicate success.
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Calendar endpoint returned ${response.status}: ${body.slice(0, 300)}`);
  }

  let result: { ok?: boolean; error?: string; slots?: string[] };
  try {
    result = JSON.parse(body);
  } catch {
    // A login or error page instead of JSON means the deployment's access is
    // not set to "Anyone", or the URL points at the editor rather than /exec.
    throw new Error(`Calendar endpoint returned a non-JSON response: ${body.slice(0, 300)}`);
  }

  if (!result.ok) {
    if (result.error === "slot_taken") throw new SlotTakenError();
    throw new Error(`Calendar endpoint rejected the request: ${result.error ?? "unknown error"}`);
  }
  return result;
}

/** The slots still free on a given day, as HH:mm in Luanda time. */
async function fetchAvailableSlots(date: string): Promise<string[]> {
  const result = await callEndpoint({ action: "slots", date });
  return result.slots ?? [];
}

/** Creates the meeting on the company calendar and invites the lead. */
async function createMeetingEvent(params: CreateMeetingEventParams) {
  await callEndpoint({ action: "create", ...params });
}

export { createMeetingEvent, fetchAvailableSlots, SlotTakenError };
