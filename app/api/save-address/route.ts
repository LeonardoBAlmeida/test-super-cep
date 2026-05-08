import { NextRequest, NextResponse } from "next/server";
import { addressSchema } from "@/lib/validation";
import { redis } from "@/lib/redis";

const ADDRESSES_KEY = "addresses";
const SAVED_CEPS_KEY = "saved_ceps";

export async function GET(request: NextRequest) {
  const cep = request.nextUrl.searchParams.get("cep")?.replace(/\D/g, "");
  if (!cep) return NextResponse.json({ exists: false });

  const exists = await redis.sismember(SAVED_CEPS_KEY, cep);
  return NextResponse.json({ exists: exists === 1 });
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

    await Promise.all([
      redis.lpush(ADDRESSES_KEY, JSON.stringify(entry)),
      redis.sadd(SAVED_CEPS_KEY, cepDigits),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao processar requisição";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
