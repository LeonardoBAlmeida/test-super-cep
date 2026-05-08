import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addressSchema } from "@/lib/validation";
import { redis } from "@/lib/redis";

// ── Dev: filesystem ──────────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "addresses.json");

type SavedAddress = Record<string, unknown>;

async function readFile(): Promise<SavedAddress[]> {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function writeFile(addresses: SavedAddress[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(addresses, null, 2), "utf-8");
}

// ── Redis keys (production) ───────────────────────────────────────────────────

const ADDRESSES_KEY = "addresses";
const SAVED_CEPS_KEY = "saved_ceps";

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const cep = request.nextUrl.searchParams.get("cep")?.replace(/\D/g, "");
  if (!cep) return NextResponse.json({ exists: false });

  if (redis) {
    const exists = await redis.sismember(SAVED_CEPS_KEY, cep);
    return NextResponse.json({ exists: exists === 1 });
  }

  const addresses = await readFile();
  const exists = addresses.some(
    (a) => String(a.cep ?? "").replace(/\D/g, "") === cep,
  );
  return NextResponse.json({ exists });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = await addressSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const cepDigits = validated.cep.replace(/\D/g, "");
    const entry = { ...validated, savedAt: new Date().toISOString() };

    if (redis) {
      await Promise.all([
        redis.lpush(ADDRESSES_KEY, JSON.stringify(entry)),
        redis.sadd(SAVED_CEPS_KEY, cepDigits),
      ]);
    } else {
      const addresses = await readFile();
      addresses.push(entry);
      await writeFile(addresses);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao processar requisição";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
