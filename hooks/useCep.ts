"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "@/types/address";

async function fetchCep(cep: string): Promise<Address> {
  const res = await fetch(`/api/cep/${cep}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "CEP não encontrado");
  }
  return res.json();
}

export function useCep(cep: string) {
  const sanitized = cep.replace(/\D/g, "");

  return useQuery<Address, Error>({
    queryKey: ["cep", sanitized],
    queryFn: () => fetchCep(sanitized),
    enabled: sanitized.length === 8,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
