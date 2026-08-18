const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

// In-memory sliding window, keyed by client IP. Good enough to blunt a
// single bot hammering the form on one server instance; a serverless
// deployment with multiple instances (each with its own memory) won't
// share state across them — swap for a shared store (Upstash Redis, Vercel
// KV) if that gap matters at your traffic scale.
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

export { isRateLimited };
