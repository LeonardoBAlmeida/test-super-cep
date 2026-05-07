"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCep } from "@/hooks/useCep";
import { addressSchema, AddressFormData } from "@/lib/validation";
import { useTheme } from "@/providers/ThemeProvider";

const BRAND = "#36E0A1";

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && (
          <span className="ml-0.5 font-bold" style={{ color: BRAND }}>
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 " +
  "border focus:outline-none focus:ring-2 transition-all duration-200 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const inputStyle = {
  borderColor: BRAND,
  "--tw-ring-color": BRAND,
} as React.CSSProperties;

type SaveStatus = "idle" | "saving" | "success" | "error";

interface DuplicateState {
  show: boolean;
  cep: string;
  confirmed: boolean;
  pendingData: AddressFormData | null;
}

export function AddressForm() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const [cepValue, setCepValue] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [duplicate, setDuplicate] = useState<DuplicateState>({
    show: false,
    cep: "",
    confirmed: false,
    pendingData: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      cep: "",
      logradouro: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });

  const { data: addressData, isFetching, isError, error } = useCep(cepValue);

  useEffect(() => {
    if (addressData) {
      setValue("logradouro", addressData.logradouro, { shouldValidate: true });
      setValue("complemento", addressData.complemento, { shouldValidate: true });
      setValue("bairro", addressData.bairro, { shouldValidate: true });
      setValue("cidade", addressData.cidade, { shouldValidate: true });
      setValue("estado", addressData.estado, { shouldValidate: true });
    }
  }, [addressData, setValue]);

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCep(e.target.value);
    setValue("cep", formatted, { shouldValidate: false });
    e.target.value = formatted;
    setDuplicate({ show: false, cep: "", confirmed: false, pendingData: null });
  }

  function handleCepBlur() {
    const digits = watch("cep").replace(/\D/g, "");
    if (digits.length === 8) setCepValue(digits);
  }

  function handleClear() {
    reset();
    setCepValue("");
    setSaveStatus("idle");
    setDuplicate({ show: false, cep: "", confirmed: false, pendingData: null });
  }

  async function persistAddress(data: AddressFormData) {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/save-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("success");
      setDuplicate({ show: false, cep: "", confirmed: false, pendingData: null });
      setTimeout(() => setSaveStatus("idle"), 3500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3500);
    }
  }

  async function onSubmit(data: AddressFormData) {
    if (duplicate.show) {
      if (duplicate.confirmed) await persistAddress(data);
      return;
    }

    const cepDigits = data.cep.replace(/\D/g, "");
    const checkRes = await fetch(`/api/save-address?cep=${cepDigits}`);
    const { exists } = await checkRes.json();

    if (exists) {
      setDuplicate({ show: true, cep: data.cep, confirmed: false, pendingData: data });
      return;
    }

    await persistAddress(data);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background: isDark
          ? `linear-gradient(to right, #000000 58%, ${BRAND} 58%)`
          : `linear-gradient(to right, #ffffff 58%, ${BRAND} 58%)`,
      }}
    >
      <div className="w-full max-w-xl">
        {/* Card */}
        <div
          className="relative bg-[#f0faf6] dark:bg-[#0d1f18] rounded-2xl p-6 sm:p-10 shadow-xl"
          style={{ border: `2px solid ${BRAND}` }}
        >
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="absolute top-3 right-3 p-2 rounded-full transition-colors duration-200"
            style={{ backgroundColor: `${BRAND}25`, color: BRAND }}
            aria-label={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            Consulta de Endereço
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
            Preencha o CEP para buscar o endereço automaticamente
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* CEP + Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="CEP:" error={errors.cep?.message} required>
                <div className="relative">
                  <input
                    {...register("cep")}
                    type="text"
                    placeholder="00000-000"
                    inputMode="numeric"
                    maxLength={9}
                    onChange={handleCepChange}
                    onBlur={handleCepBlur}
                    className={inputClass}
                    style={inputStyle}
                  />
                  {isFetching && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4" style={{ color: BRAND }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    </span>
                  )}
                </div>
                {isError && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                    {(error as Error)?.message ?? "Erro ao buscar CEP"}
                  </p>
                )}
              </Field>

              <Field label="Estado (UF):" error={errors.estado?.message} required>
                <input
                  {...register("estado")}
                  type="text"
                  placeholder="DF"
                  maxLength={2}
                  className={inputClass}
                  style={inputStyle}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
                    register("estado").onChange(e);
                  }}
                />
              </Field>
            </div>

            <Field label="Logradouro:" error={errors.logradouro?.message} required>
              <input
                {...register("logradouro")}
                type="text"
                placeholder="Rua, Avenida, Praça..."
                className={inputClass}
                style={inputStyle}
              />
            </Field>

            <Field label="Complemento:" error={errors.complemento?.message}>
              <input
                {...register("complemento")}
                type="text"
                placeholder="Apto, Bloco, Sala... (opcional)"
                className={inputClass}
                style={inputStyle}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Bairro:" error={errors.bairro?.message} required>
                <input
                  {...register("bairro")}
                  type="text"
                  placeholder="Bairro"
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>

              <Field label="Cidade:" error={errors.cidade?.message} required>
                <input
                  {...register("cidade")}
                  type="text"
                  placeholder="Cidade"
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
            </div>

            {/* Duplicate confirmation */}
            {duplicate.show && (
              <div
                className="rounded-xl p-4 space-y-3 bg-white dark:bg-gray-800"
                style={{ border: `1.5px solid ${BRAND}` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND}25` }}
                  >
                    <svg className="h-4 w-4" style={{ color: BRAND }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">CEP já cadastrado</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                      O CEP{" "}
                      <span className="font-mono font-bold">{duplicate.cep}</span>{" "}
                      já foi salvo anteriormente. Deseja salvar novamente?
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={duplicate.confirmed}
                    onChange={(e) =>
                      setDuplicate((prev) => ({ ...prev, confirmed: e.target.checked }))
                    }
                    className="h-4 w-4 rounded cursor-pointer"
                    style={{ accentColor: BRAND }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    Confirmo que desejo salvar este endereço novamente
                  </span>
                </label>
              </div>
            )}

            {/* Feedback */}
            {saveStatus === "success" && (
              <div
                className="flex items-center gap-2.5 p-3.5 rounded-xl text-sm bg-white dark:bg-gray-800 font-medium"
                style={{ border: `1.5px solid ${BRAND}`, color: "#1a9c6b" }}
              >
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Endereço salvo com sucesso!
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium">
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Erro ao salvar. Tente novamente.
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 rounded-xl px-6 py-2.5 text-sm font-semibold
                  focus:outline-none focus:ring-2 active:scale-[0.98] transition-all duration-200 border-2"
                style={{
                  borderColor: BRAND,
                  color: BRAND,
                  backgroundColor: isDark ? "#1f2937" : "white",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${BRAND}15`)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDark ? "#1f2937" : "white")}
              >
                LIMPAR
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  saveStatus === "saving" ||
                  (duplicate.show && !duplicate.confirmed)
                }
                className="flex-1 rounded-xl px-6 py-2.5 text-sm font-semibold
                  active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 uppercase tracking-wide"
                style={{
                  backgroundColor: BRAND,
                  color: isDark ? "#000000" : "#ffffff",
                  ["--tw-ring-color" as string]: BRAND,
                }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = "0.87"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {saveStatus === "saving" ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Salvando...
                  </>
                ) : duplicate.show ? (
                  "Confirmar e Salvar"
                ) : (
                  "Salvar Endereço"
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          ViaCEP · BrazilAPI (fallback)
        </p>
      </div>
    </div>
  );
}
