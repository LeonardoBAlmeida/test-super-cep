import axios from "axios";
import { Address, BrazilApiResponse, ViaCepResponse } from "@/types/address";

const VIACEP_URL = "https://viacep.com.br/ws";
const BRAZILAPI_URL = "https://brasilapi.com.br/api/cep/v1";

function sanitizeCep(cep: string): string {
  return cep.replace(/\D/g, "");
}

async function fetchFromViaCep(cep: string): Promise<Address> {
  const { data } = await axios.get<ViaCepResponse>(`${VIACEP_URL}/${cep}/json`);

  if (data.erro) {
    throw new Error("CEP não encontrado no ViaCEP");
  }

  return {
    cep: data.cep,
    logradouro: data.logradouro,
    complemento: data.complemento,
    bairro: data.bairro,
    cidade: data.localidade,
    estado: data.uf,
  };
}

async function fetchFromBrazilApi(cep: string): Promise<Address> {
  const { data } = await axios.get<BrazilApiResponse>(
    `${BRAZILAPI_URL}/${cep}`
  );

  return {
    cep: data.cep,
    logradouro: data.street,
    complemento: "",
    bairro: data.neighborhood,
    cidade: data.city,
    estado: data.state,
  };
}

export async function fetchAddressByCep(rawCep: string): Promise<Address> {
  const cep = sanitizeCep(rawCep);

  if (cep.length !== 8) {
    throw new Error("CEP deve conter 8 dígitos");
  }

  try {
    return await fetchFromViaCep(cep);
  } catch {
    return await fetchFromBrazilApi(cep);
  }
}
