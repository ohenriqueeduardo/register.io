import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve conter uma letra minúscula.")
  .regex(/\d/, "A senha deve conter um número.");

export const registerSchema = z.object({
  nome: z.string().trim().min(2, "Nome obrigatório."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(1, "Senha obrigatória."),
});

export const accountProfileSchema = z.object({
  action: z.literal("profile"),
  nome: z.string().trim().min(2, "Nome obrigatório."),
});

export const accountEmailSchema = z.object({
  action: z.literal("email"),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  currentPassword: z.string().min(1, "Informe sua senha atual."),
});

export const accountPasswordSchema = z.object({
  action: z.literal("password"),
  currentPassword: z.string().min(1, "Informe sua senha atual."),
  newPassword: passwordSchema,
});

export const accountUpdateSchema = z.discriminatedUnion("action", [
  accountProfileSchema,
  accountEmailSchema,
  accountPasswordSchema,
]);

export const accountDeleteSchema = z.object({
  currentPassword: z.string().min(1, "Informe sua senha atual."),
});
