/**
 * Visio Nexum — calendar endpoint.
 *
 * Deployed as an Apps Script Web App and called by the contact form's API
 * route. It runs as the owning account, so events are created on the company
 * calendar and attendee invitations are sent normally; a Cloud service account
 * cannot invite attendees without domain-wide delegation, which this avoids.
 *
 * Deployment: execute as the owning account, access "Anyone". The URL is
 * therefore unauthenticated and requests are authorised by a shared secret
 * held in Script Properties, never in this file.
 *
 * Script Properties:
 *   SHARED_SECRET  required, must match GOOGLE_CALENDAR_WEBAPP_SECRET
 *   CALENDAR_ID    optional, defaults to the owning account's calendar
 */

var TIME_ZONE = 'Africa/Luanda';

function doPost(request) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var secret = properties.getProperty('SHARED_SECRET');
    if (!secret) return respond(500, 'SHARED_SECRET is not set in Script Properties');

    var payload = JSON.parse(request.postData.contents);
    if (payload.secret !== secret) return respond(401, 'Unauthorized');

    var calendarId = properties.getProperty('CALENDAR_ID');
    var calendar = calendarId
      ? CalendarApp.getCalendarById(calendarId)
      : CalendarApp.getDefaultCalendar();
    if (!calendar) return respond(500, 'Calendar not found: ' + calendarId);

    var event = calendar.createEvent(
      payload.summary,
      new Date(payload.startISO),
      new Date(payload.endISO),
      {
        description: payload.description,
        guests: payload.attendeeEmail,
        sendInvites: true,
      }
    );

    return respond(200, null, { eventId: event.getId() });
  } catch (error) {
    return respond(500, String(error));
  }
}

/** Confirms the deployment is reachable and configured, without creating anything. */
function doGet() {
  var configured = Boolean(PropertiesService.getScriptProperties().getProperty('SHARED_SECRET'));
  return respond(200, null, { service: 'visio-nexum-calendar', configured: configured });
}

function respond(status, error, data) {
  var body = { ok: !error, status: status };
  if (error) body.error = error;
  if (data) for (var key in data) body[key] = data[key];

  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON
  );
}
