"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAddressByCep } from "@/lib/cep-service";

export function useCep(cep: string) {
  const sanitized = cep.replace(/\D/g, "");

  return useQuery({
    queryKey: ["cep", sanitized],
    queryFn: () => fetchAddressByCep(sanitized),
    enabled: sanitized.length === 8,
    staleTime: 1000 * 60 * 10,
  });
}
