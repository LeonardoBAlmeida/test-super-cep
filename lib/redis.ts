import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var _redis: Redis | null | undefined;
}

function createClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 2 });
  client.on("error", (err) => console.error("[Redis]", err.message));
  return client;
}

if (globalThis._redis === undefined) {
  globalThis._redis = createClient();
}

// null  → REDIS_URL not set (dev / local without Redis)
// Redis → connected instance (production)
export const redis = globalThis._redis as Redis | null;
