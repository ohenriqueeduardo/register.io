import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth";

type FieldErrors = Record<string, string[]>;

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function failure(
  message: string,
  status = 400,
  errors?: FieldErrors,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    },
    { status },
  );
}

export function validationFailure(error: ZodError) {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    errors[path] = [...(errors[path] ?? []), issue.message];
  }

  return failure("Dados inválidos.", 400, errors);
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return failure(error.message, error.status);
  }

  console.error(error);
  return failure("Erro interno do servidor.", 500);
}
