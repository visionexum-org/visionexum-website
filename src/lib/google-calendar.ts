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

/**
 * Creates the meeting on the company calendar and invites the lead.
 *
 * The request goes to an Apps Script Web App (source in
 * scripts/calendar-webapp.gs) rather than the Calendar API directly. The
 * script runs as the account that owns the calendar, so invitations are sent
 * normally; a Cloud service account cannot invite attendees without
 * domain-wide delegation. The endpoint is unauthenticated by deployment, so
 * the shared secret authorises the call.
 */
async function createMeetingEvent(params: CreateMeetingEventParams) {
  const endpoint = process.env.GOOGLE_CALENDAR_WEBAPP_URL;
  const secret = process.env.GOOGLE_CALENDAR_WEBAPP_SECRET;

  if (!endpoint || !secret) {
    throw new Error(
      "Google Calendar not configured — set GOOGLE_CALENDAR_WEBAPP_URL and GOOGLE_CALENDAR_WEBAPP_SECRET."
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, ...params }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // The deployment answers 200 and reports its own outcome in the body, so the
  // transport status alone does not indicate success.
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Calendar endpoint returned ${response.status}: ${body.slice(0, 300)}`);
  }

  let result: { ok?: boolean; error?: string };
  try {
    result = JSON.parse(body);
  } catch {
    // A login or error page instead of JSON means the deployment's access is
    // not set to "Anyone", or the URL points at the editor rather than /exec.
    throw new Error(`Calendar endpoint returned a non-JSON response: ${body.slice(0, 300)}`);
  }

  if (!result.ok) {
    throw new Error(`Calendar endpoint rejected the request: ${result.error ?? "unknown error"}`);
  }
}

export { createMeetingEvent };
