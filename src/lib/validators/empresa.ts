import { z } from "zod";
import { isValidCNPJ } from "./cnpj";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const phoneSchema = z.string().trim().refine((value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}, "Telefone invalido.");

const optionalPhoneSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length === 10 || digits.length === 11;
    }, "Telefone invalido.")
    .optional(),
);

const optionalEmailSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().email("E-mail invalido.").optional(),
);

const catalogMetadataSchema = {
  catalogoUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("URL do catalogo invalida.").nullable().optional(),
  ),
  catalogoPath: z.preprocess(
    emptyToUndefined,
    z.string().trim().nullable().optional(),
  ),
  catalogoNome: z.preprocess(
    emptyToUndefined,
    z.string().trim().nullable().optional(),
  ),
  catalogoMimeType: z.preprocess(
    emptyToUndefined,
    z.string().trim().nullable().optional(),
  ),
  catalogoTamanho: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().positive().nullable().optional(),
  ),
};

const especialidadesServerSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (!value) {
      return [];
    }

    const items = Array.isArray(value) ? value : value.split(",");
    return items.map((item) => item.trim()).filter(Boolean);
  });

export const empresaFormSchema = z.object({
  nomeEmpresa: z.string().trim().min(2, "Nome da empresa obrigatorio."),
  cnpj: z.string().trim().refine(isValidCNPJ, "CNPJ invalido."),
  nomeRepresentante: z
    .string()
    .trim()
    .min(2, "Nome do representante obrigatorio."),
  telefoneRepresentante: phoneSchema,
  telefoneEmpresa: optionalPhoneSchema,
  email1: z.string().trim().email("E-mail principal invalido."),
  email2: optionalEmailSchema,
  trabalhaComApoioCotacoes: z.boolean({
    required_error: "Informe se trabalha com Apoio Cotacoes.",
  }),
  categoriaId: z.string().trim().min(1, "Selecione uma categoria."),
  especialidades: z.string().optional(),
});

export const empresaCreateSchema = z.object({
  nomeEmpresa: z.string().trim().min(2, "Nome da empresa obrigatorio."),
  cnpj: z.string().trim().refine(isValidCNPJ, "CNPJ invalido."),
  nomeRepresentante: z
    .string()
    .trim()
    .min(2, "Nome do representante obrigatorio."),
  telefoneRepresentante: phoneSchema,
  telefoneEmpresa: optionalPhoneSchema,
  email1: z.string().trim().email("E-mail principal invalido."),
  email2: optionalEmailSchema,
  trabalhaComApoioCotacoes: z.boolean({
    required_error: "Informe se trabalha com Apoio Cotacoes.",
  }),
  categoriaId: z.string().trim().min(1, "Selecione uma categoria."),
  especialidades: especialidadesServerSchema,
  ...catalogMetadataSchema,
});

export const empresaUpdateSchema = empresaCreateSchema.partial();

export type EmpresaFormValues = z.infer<typeof empresaFormSchema>;
