import * as yup from "yup";

export const addressSchema = yup.object({
  cep: yup
    .string()
    .required("CEP é obrigatório")
    .transform((value: string) => value.replace(/\D/g, ""))
    .length(8, "CEP deve conter 8 dígitos"),

  logradouro: yup
    .string()
    .required("Logradouro é obrigatório")
    .max(200, "Máximo de 200 caracteres"),

  complemento: yup.string().max(100, "Máximo de 100 caracteres").default(""),

  bairro: yup
    .string()
    .required("Bairro é obrigatório")
    .max(100, "Máximo de 100 caracteres"),

  cidade: yup
    .string()
    .required("Cidade é obrigatória")
    .max(100, "Máximo de 100 caracteres"),

  estado: yup
    .string()
    .required("Estado é obrigatório")
    .length(2, "Use a sigla do estado (ex: DF)")
    .uppercase(),
});

export type AddressFormData = yup.InferType<typeof addressSchema>;
