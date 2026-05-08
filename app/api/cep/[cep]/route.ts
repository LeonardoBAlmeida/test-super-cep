import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { fetchAddressByCep } from "@/lib/cep-service";

const CACHE_TTL = 60 * 60 * 24; // 1 day in seconds

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cep: string }> },
) {
  const { cep } = await params;
  const sanitized = cep.replace(/\D/g, "");

  if (sanitized.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  const key = `cep:${sanitized}`;

  // Cache read — failures are non-fatal
  try {
    const hit = await redis.get(key);
    if (hit) return NextResponse.json(JSON.parse(hit));
  } catch (err) {
    console.warn("[Redis] cache read failed:", (err as Error).message);
  }

  // Fetch from ViaCEP / BrazilAPI
  try {
    const address = await fetchAddressByCep(sanitized);

    // Cache write — failures are non-fatal
    try {
      await redis.setex(key, CACHE_TTL, JSON.stringify(address));
    } catch (err) {
      console.warn("[Redis] cache write failed:", (err as Error).message);
    }

    return NextResponse.json(address);
  } catch (err) {
    const message = err instanceof Error ? err.message : "CEP não encontrado";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
