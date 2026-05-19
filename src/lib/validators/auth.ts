import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().trim().min(2, "Nome obrigatorio."),
  email: z.string().trim().toLowerCase().email("E-mail invalido."),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .regex(/[A-Z]/, "A senha deve conter uma letra maiuscula.")
    .regex(/[a-z]/, "A senha deve conter uma letra minuscula.")
    .regex(/\d/, "A senha deve conter um numero."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail invalido."),
  password: z.string().min(1, "Senha obrigatoria."),
});
