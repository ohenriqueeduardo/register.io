import { z } from "zod";

export const categoriaSchema = z.object({
  nome: z.string().trim().min(2, "Nome da categoria obrigatorio."),
});
