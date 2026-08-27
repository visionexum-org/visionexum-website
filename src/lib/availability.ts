/**
 * Booking rules for the diagnostic meeting.
 *
 * These values are mirrored in scripts/calendar-webapp.gs, which enforces them
 * inside Apps Script where this module cannot reach. Change both together.
 *
 * The rules decide which slots may be offered at all; the calendar's own
 * occupancy decides which of those are still free, and that check lives in the
 * Apps Script deployment because only it can read the calendar.
 */
const AVAILABILITY = {
  timeZone: "Africa/Luanda",
  // Luanda observes UTC+1 year-round with no daylight saving, so a fixed
  // offset is exact and avoids resolving the zone at runtime.
  utcOffset: "+01:00",
  workdays: [1, 2, 3, 4, 5], // Monday to Friday, matching Date#getUTCDay
  openMinutes: 10 * 60,
  closeMinutes: 18 * 60,
  slotMinutes: 30,
  durationMinutes: 30,
  minNoticeHours: 24,
  horizonDays: 30,
} as const;

const MINUTES_PER_DAY = 24 * 60;

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function minutesToTime(minutes: number) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Every slot the working day contains, before occupancy is considered. */
function slotTimes(): string[] {
  const times: string[] = [];
  const last = AVAILABILITY.closeMinutes - AVAILABILITY.durationMinutes;
  for (let m = AVAILABILITY.openMinutes; m <= last; m += AVAILABILITY.slotMinutes) {
    times.push(minutesToTime(m));
  }
  return times;
}

/** Resolves a calendar day and wall-clock time in Luanda to an instant. */
function toInstant(dateISO: string, time: string) {
  return new Date(`${dateISO}T${time}:00${AVAILABILITY.utcOffset}`);
}

/** The calendar day in Luanda that a given instant falls on, as yyyy-MM-dd. */
function luandaDay(instant: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: AVAILABILITY.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

function isWorkday(dateISO: string) {
  // Midday sits far enough from both boundaries that the offset cannot shift
  // the reading onto an adjacent day.
  const weekday = toInstant(dateISO, "12:00").getUTCDay();
  return (AVAILABILITY.workdays as readonly number[]).includes(weekday);
}

/** First day that can hold a slot once the notice period is applied. */
function earliestDay(now = new Date()) {
  return luandaDay(new Date(now.getTime() + AVAILABILITY.minNoticeHours * 60 * 60_000));
}

/** Last day inside the booking horizon. */
function latestDay(now = new Date()) {
  return luandaDay(new Date(now.getTime() + AVAILABILITY.horizonDays * MINUTES_PER_DAY * 60_000));
}

/** Whether a day may be offered at all: a workday inside the booking window. */
function isBookableDay(dateISO: string, now = new Date()) {
  return isWorkday(dateISO) && dateISO >= earliestDay(now) && dateISO <= latestDay(now);
}

type SlotRejection = "format" | "closed" | "weekend" | "notice" | "horizon";

/**
 * Applies every rule that does not require reading the calendar. A slot that
 * passes here is offerable in principle; whether it is still free is a
 * separate question answered by the Apps Script deployment.
 */
function validateSlot(
  dateISO: string,
  time: string,
  now = new Date()
): { ok: true } | { ok: false; reason: SlotRejection } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO) || !/^\d{2}:\d{2}$/.test(time)) {
    return { ok: false, reason: "format" };
  }

  const start = toInstant(dateISO, time);
  if (Number.isNaN(start.getTime())) return { ok: false, reason: "format" };

  if (!slotTimes().includes(time)) return { ok: false, reason: "closed" };
  if (!isWorkday(dateISO)) return { ok: false, reason: "weekend" };

  const noticeCutoff = now.getTime() + AVAILABILITY.minNoticeHours * 60 * 60_000;
  if (start.getTime() < noticeCutoff) return { ok: false, reason: "notice" };

  const horizonCutoff = now.getTime() + AVAILABILITY.horizonDays * MINUTES_PER_DAY * 60_000;
  if (start.getTime() > horizonCutoff) return { ok: false, reason: "horizon" };

  return { ok: true };
}

export {
  AVAILABILITY,
  slotTimes,
  toInstant,
  luandaDay,
  isWorkday,
  isBookableDay,
  earliestDay,
  latestDay,
  validateSlot,
  timeToMinutes,
  minutesToTime,
};
