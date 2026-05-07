import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addressSchema } from "@/lib/validation";

const DATA_FILE = path.join(process.cwd(), "data", "addresses.json");

interface SavedAddress {
  cep: string;
  savedAt: string;
  [key: string]: unknown;
}

async function readAddresses(): Promise<SavedAddress[]> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const cep = request.nextUrl.searchParams.get("cep")?.replace(/\D/g, "");
  if (!cep) return NextResponse.json({ exists: false });

  const addresses = await readAddresses();
  const exists = addresses.some((a) => a.cep.replace(/\D/g, "") === cep);

  return NextResponse.json({ exists });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = await addressSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const addresses = await readAddresses();
    addresses.push({ ...validated, savedAt: new Date().toISOString() });

    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(addresses, null, 2), "utf-8");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro ao processar requisição";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
