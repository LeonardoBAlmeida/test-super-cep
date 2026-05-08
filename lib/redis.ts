import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

function createClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL environment variable is not set");

  const client = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 2 });
  client.on("error", (err) => console.error("[Redis]", err.message));
  return client;
}

// Reuse connection across hot-reloads in dev; each container in prod keeps one instance
const redis = globalThis._redis ?? createClient();
if (process.env.NODE_ENV !== "production") globalThis._redis = redis;

export { redis };
