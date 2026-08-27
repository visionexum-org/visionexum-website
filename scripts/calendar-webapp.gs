/**
 * Visio Nexum — calendar endpoint.
 *
 * Deployed as an Apps Script Web App and called by the website's server. It
 * runs as the account owning the calendar, so events are created on the
 * company calendar and attendee invitations are sent normally; a Cloud service
 * account cannot invite attendees without domain-wide delegation.
 *
 * Two actions:
 *   slots   returns the free slots for one day
 *   create  books a slot, re-checking availability first
 *
 * Deployment: execute as the owning account, access "Anyone". The URL is
 * therefore unauthenticated and requests are authorised by a shared secret
 * held in Script Properties, never in this file.
 *
 * Script Properties:
 *   SHARED_SECRET  required, must match GOOGLE_CALENDAR_WEBAPP_SECRET
 *   CALENDAR_ID    optional, defaults to the owning account's calendar
 *
 * Optional: enabling the advanced Calendar service (Services -> Calendar API)
 * adds a Google Meet link to each event. Without it everything still works,
 * only without the link.
 *
 * Booking rules are mirrored in src/lib/availability.ts. Change both together.
 */

var TIME_ZONE = 'Africa/Luanda';
var UTC_OFFSET = '+01:00'; // Luanda does not observe daylight saving
var WORKDAYS = [1, 2, 3, 4, 5]; // Monday to Friday
var OPEN_MINUTES = 10 * 60;
var CLOSE_MINUTES = 18 * 60;
var SLOT_MINUTES = 30;
var DURATION_MINUTES = 30;
var MIN_NOTICE_HOURS = 24;
var HORIZON_DAYS = 30;

function doPost(request) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var secret = properties.getProperty('SHARED_SECRET');
    if (!secret) return respond(500, 'SHARED_SECRET is not set in Script Properties');

    var payload = JSON.parse(request.postData.contents);
    if (payload.secret !== secret) return respond(401, 'Unauthorized');

    var calendar = resolveCalendar(properties);
    if (!calendar) return respond(500, 'Calendar not found');

    if (payload.action === 'slots') return handleSlots(calendar, payload);
    if (payload.action === 'create') return handleCreate(calendar, payload);
    return respond(400, 'Unknown action: ' + payload.action);
  } catch (error) {
    return respond(500, String(error));
  }
}

/** Confirms the deployment is reachable and configured, without creating anything. */
function doGet() {
  var configured = Boolean(PropertiesService.getScriptProperties().getProperty('SHARED_SECRET'));
  return respond(200, null, {
    service: 'visio-nexum-calendar',
    configured: configured,
    meetEnabled: hasAdvancedCalendarService(),
  });
}

// ---------------------------------------------------------------- actions

function handleSlots(calendar, payload) {
  if (!isValidDate(payload.date)) return respond(400, 'Invalid date: ' + payload.date);
  return respond(200, null, { date: payload.date, slots: freeSlots(calendar, payload.date) });
}

function handleCreate(calendar, payload) {
  var start = new Date(payload.startISO);
  var end = new Date(payload.endISO);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return respond(400, 'Invalid start or end');

  // The slot is re-checked here rather than trusted from the caller: the page
  // may have been open for hours, and two submissions can arrive together.
  var date = formatDay(start);
  if (freeSlots(calendar, date).indexOf(formatTime(start)) === -1) {
    return respond(409, 'slot_taken');
  }

  var event = createEvent(calendar, payload, start, end);
  return respond(200, null, { eventId: event.id, meetLink: event.meetLink || null });
}

// ---------------------------------------------------------------- slots

/** Slots the rules allow on this day that the calendar has not already taken. */
function freeSlots(calendar, date) {
  if (WORKDAYS.indexOf(weekdayOf(date)) === -1) return [];

  var now = new Date();
  var noticeCutoff = now.getTime() + MIN_NOTICE_HOURS * 3600000;
  var horizonCutoff = now.getTime() + HORIZON_DAYS * 86400000;

  var dayStart = instantAt(date, OPEN_MINUTES);
  var dayEnd = instantAt(date, CLOSE_MINUTES);
  var busy = busyRanges(calendar, dayStart, dayEnd);
  if (busy === null) return []; // an all-day event blocks the whole day

  var slots = [];
  for (var m = OPEN_MINUTES; m + DURATION_MINUTES <= CLOSE_MINUTES; m += SLOT_MINUTES) {
    var slotStart = instantAt(date, m).getTime();
    var slotEnd = slotStart + DURATION_MINUTES * 60000;

    if (slotStart < noticeCutoff) continue;
    if (slotStart > horizonCutoff) continue;
    if (overlapsAny(slotStart, slotEnd, busy)) continue;

    slots.push(minutesToTime(m));
  }
  return slots;
}

/**
 * Occupied intervals within the day. Returns null when an all-day event covers
 * the day, which is the natural way to mark a day unavailable: the team blocks
 * time in the calendar exactly as they would for anything else.
 */
function busyRanges(calendar, dayStart, dayEnd) {
  var events = calendar.getEvents(dayStart, dayEnd);
  var ranges = [];

  for (var i = 0; i < events.length; i++) {
    var event = events[i];

    // An invitation that was declined does not occupy the time.
    try {
      if (event.getMyStatus() === CalendarApp.GuestStatus.NO) continue;
    } catch (error) {
      // Owned events have no guest status; they occupy the time regardless.
    }

    if (event.isAllDayEvent()) return null;
    ranges.push({ start: event.getStartTime().getTime(), end: event.getEndTime().getTime() });
  }
  return ranges;
}

function overlapsAny(start, end, ranges) {
  for (var i = 0; i < ranges.length; i++) {
    if (start < ranges[i].end && end > ranges[i].start) return true;
  }
  return false;
}

// ---------------------------------------------------------------- creation

/**
 * Prefers the advanced Calendar service, which is the only way to attach a
 * Meet link, and falls back to CalendarApp when it has not been enabled.
 */
function createEvent(calendar, payload, start, end) {
  if (hasAdvancedCalendarService()) {
    var created = Calendar.Events.insert(
      {
        summary: payload.summary,
        description: payload.description,
        start: { dateTime: start.toISOString(), timeZone: TIME_ZONE },
        end: { dateTime: end.toISOString(), timeZone: TIME_ZONE },
        attendees: [{ email: payload.attendeeEmail }],
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: false,
        conferenceData: {
          createRequest: {
            requestId: Utilities.getUuid(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
      calendar.getId(),
      { conferenceDataVersion: 1, sendUpdates: 'all' }
    );
    return { id: created.id, meetLink: created.hangoutLink };
  }

  var event = calendar.createEvent(payload.summary, start, end, {
    description: payload.description,
    guests: payload.attendeeEmail,
    sendInvites: true,
  });
  event.setGuestsCanInviteOthers(false);
  event.setGuestsCanSeeGuests(false);
  return { id: event.getId(), meetLink: null };
}

function hasAdvancedCalendarService() {
  try {
    return typeof Calendar !== 'undefined' && Boolean(Calendar.Events);
  } catch (error) {
    return false;
  }
}

// ---------------------------------------------------------------- helpers

function resolveCalendar(properties) {
  var calendarId = properties.getProperty('CALENDAR_ID');
  return calendarId ? CalendarApp.getCalendarById(calendarId) : CalendarApp.getDefaultCalendar();
}

function isValidDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Wall-clock minutes on a Luanda calendar day, as an absolute instant. */
function instantAt(date, minutes) {
  return new Date(date + 'T' + minutesToTime(minutes) + ':00' + UTC_OFFSET);
}

function weekdayOf(date) {
  // Midday sits far enough from both boundaries that the offset cannot shift
  // the reading onto an adjacent day.
  return instantAt(date, 12 * 60).getUTCDay();
}

function minutesToTime(minutes) {
  return pad(Math.floor(minutes / 60)) + ':' + pad(minutes % 60);
}

function formatDay(instant) {
  return Utilities.formatDate(instant, TIME_ZONE, 'yyyy-MM-dd');
}

function formatTime(instant) {
  return Utilities.formatDate(instant, TIME_ZONE, 'HH:mm');
}

function pad(value) {
  return value < 10 ? '0' + value : String(value);
}

function respond(status, error, data) {
  var body = { ok: !error, status: status };
  if (error) body.error = error;
  if (data) for (var key in data) body[key] = data[key];

  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON
  );
}
