import { NextResponse } from "next/server";
import { AuthError } from "./auth";
import { ZodError } from "zod";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(error: unknown) {
  console.error("[API Error]", error);

  if (error instanceof AuthError) {
    return apiError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    const messages = error.issues.map((e) => `${String(e.path.join("."))}: ${e.message}`).join("; ");
    return apiError(messages, 400);
  }

  if (error instanceof Error) {
    return apiError(error.message, 500);
  }

  return apiError("Erro interno do servidor", 500);
}
