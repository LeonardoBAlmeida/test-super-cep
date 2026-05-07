export interface Address {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface BrazilApiResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service?: string;
  errors?: { name: string; message: string; type: string }[];
}
