import { NextResponse } from "next/server";
import { z } from "zod";

import { fetchAvailableSlots } from "@/lib/google-calendar";
import { isBookableDay, slotTimes, validateSlot } from "@/lib/availability";
import { isRateLimited } from "@/lib/rate-limit";

// Browsing the calendar hits this on every day selected, so the allowance is
// wider than the submission endpoint's.
const MAX_REQUESTS_PER_MINUTE = 40;

const querySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

/**
 * The slots offerable on one day. Proxied rather than called from the browser
 * so the Apps Script secret stays on the server.
 */
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`slots:${ip}`, MAX_REQUESTS_PER_MINUTE)) {
    return NextResponse.json({ ok: false, slots: [] }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ date: searchParams.get("date") });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, slots: [] }, { status: 400 });
  }

  const { date } = parsed.data;
  if (!isBookableDay(date)) {
    return NextResponse.json({ ok: true, slots: [] });
  }

  // The rules alone already exclude slots inside the notice period and beyond
  // the horizon, so a day with none of those left needs no round trip.
  const allowed = slotTimes().filter((time) => validateSlot(date, time).ok);
  if (allowed.length === 0) {
    return NextResponse.json({ ok: true, slots: [] });
  }

  try {
    const free = await fetchAvailableSlots(date);
    return NextResponse.json({ ok: true, slots: free });
  } catch (error) {
    // With the calendar unreachable the rules still hold, so the day stays
    // bookable and the deployment re-checks occupancy before creating.
    console.error("Availability lookup failed:", error);
    return NextResponse.json({ ok: true, slots: allowed, degraded: true });
  }
}
