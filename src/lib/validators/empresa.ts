import { z } from "zod";


const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const phoneSchema = z.string().trim().refine((value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}, "Telefone inválido.");

const optionalPhoneSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length === 10 || digits.length === 11;
    }, "Telefone inválido.")
    .optional(),
);

const optionalEmailSchema = z.preprocess(
  emptyToUndefined,
  z.string().trim().email("E-mail inválido.").optional(),
);

const catalogMetadataSchema = {
  catalogoUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("URL do catálogo inválida.").nullable().optional(),
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

const optionalTrimmedString = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional(),
);

const apoioFilterSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "" || value === "all") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();

    if (["true", "1", "sim", "yes"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "nao", "não", "no"].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean().optional());

export const empresaFormSchema = z.object({
  nomeEmpresa: z.string().trim().min(2, "Nome da empresa obrigatório."),
  cnpj: z
    .string()
    .trim()
    .refine(
      (val) => val.replace(/\D/g, "").length === 14,
      "CNPJ deve conter exatamente 14 dígitos.",
    ),
  nomeRepresentante: z
    .string()
    .trim()
    .min(2, "Nome do representante obrigatório."),
  telefoneRepresentante: phoneSchema,
  telefoneEmpresa: optionalPhoneSchema,
  email1: z.string().trim().email("E-mail principal inválido."),
  email2: optionalEmailSchema,
  trabalhaComApoioCotacoes: z.boolean({
    required_error: "Informe se trabalha com Apoio Cotações.",
  }),
  categoriaId: z.string().trim().min(1, "Selecione uma categoria."),
  especialidades: z.string().optional(),
});

export const empresaCreateSchema = z.object({
  nomeEmpresa: z.string().trim().min(2, "Nome da empresa obrigatório."),
  cnpj: z
    .string()
    .trim()
    .refine(
      (val) => val.replace(/\D/g, "").length === 14,
      "CNPJ deve conter exatamente 14 dígitos.",
    ),
  nomeRepresentante: z
    .string()
    .trim()
    .min(2, "Nome do representante obrigatório."),
  telefoneRepresentante: phoneSchema,
  telefoneEmpresa: optionalPhoneSchema,
  email1: z.string().trim().email("E-mail principal inválido."),
  email2: optionalEmailSchema,
  trabalhaComApoioCotacoes: z.boolean({
    required_error: "Informe se trabalha com Apoio Cotações.",
  }),
  categoriaId: z.string().trim().min(1, "Selecione uma categoria."),
  especialidades: especialidadesServerSchema,
  ...catalogMetadataSchema,
});

export const empresaUpdateSchema = empresaCreateSchema.partial();

export const empresaListQuerySchema = z
  .object({
    q: optionalTrimmedString,
    search: optionalTrimmedString,
    categoriaId: optionalTrimmedString,
    trabalhaComApoioCotacoes: apoioFilterSchema,
    especialidade: optionalTrimmedString,
    page: z.coerce.number().int().min(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).catch(10),
    sortBy: z
      .enum([
        "nomeEmpresa",
        "cnpj",
        "nomeRepresentante",
        "email1",
        "categoria",
        "createdAt",
        "updatedAt",
      ])
      .catch("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).catch("desc"),
  })
  .transform((data) => ({
    ...data,
    search: data.search ?? data.q,
  }));

export type EmpresaFormValues = z.infer<typeof empresaFormSchema>;
export type EmpresaListQuery = z.infer<typeof empresaListQuerySchema>;
