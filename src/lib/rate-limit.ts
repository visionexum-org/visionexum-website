const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

// In-memory sliding window keyed by client IP. This limits repeated
// submissions against a single server instance. State is not shared across
// instances in a multi-instance deployment; a shared store such as Upstash
// Redis or Vercel KV is required where that guarantee is needed.
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

export { isRateLimited };
