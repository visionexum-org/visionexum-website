import { google } from "googleapis";

type CreateMeetingEventParams = {
  summary: string;
  description: string;
  startISO: string;
  endISO: string;
  attendeeEmail: string;
  attendeeName: string;
};

async function createMeetingEvent(params: CreateMeetingEventParams) {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!clientEmail || !privateKey || !calendarId) {
    throw new Error(
      "Google Calendar not configured — set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY and GOOGLE_CALENDAR_ID."
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.insert({
    calendarId,
    sendUpdates: "all", // emails the attendee (the lead) their invite
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startISO, timeZone: "Africa/Luanda" },
      end: { dateTime: params.endISO, timeZone: "Africa/Luanda" },
      attendees: [{ email: params.attendeeEmail, displayName: params.attendeeName }],
    },
  });
}

export { createMeetingEvent };
