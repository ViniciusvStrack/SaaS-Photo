import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { PAGINATION } from "./constants";
import { serverCache } from "./server-cache";

// ============ RESPONSE HELPERS ============

export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiPaginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1,
    },
  });
}

export function apiCreated<T>(data: T): NextResponse {
  return apiSuccess(data, 201);
}

export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ============ VALIDATION HELPERS ============

export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      return { error: apiError(messages.join("; "), 422) };
    }
    if (error instanceof SyntaxError) {
      return { error: apiError("Corpo da requisição inválido (JSON malformado)", 400) };
    }
    return { error: apiError("Erro ao processar requisição", 400) };
  }
}

export function validateParams<T>(
  params: Record<string, string | undefined>,
  schema: ZodSchema<T>
): { data: T; error?: never } | { data?: never; error: NextResponse } {
  try {
    const data = schema.parse(params);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return { error: apiError(firstIssue?.message || "Parâmetros inválidos", 400) };
    }
    return { error: apiError("Parâmetros inválidos", 400) };
  }
}

// ============ QUERY PARAMS HELPERS ============

export interface QueryParams {
  page: number;
  pageSize: number;
  search: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  startDate: string;
  endDate: string;
}

export function getQueryParams(req: NextRequest): QueryParams {
  const url = new URL(req.url);
  
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const rawPageSize = parseInt(url.searchParams.get("pageSize") || String(PAGINATION.defaultPageSize));
  const pageSize = Math.min(Math.max(1, rawPageSize), PAGINATION.maxPageSize);
  
  return {
    page,
    pageSize,
    search: url.searchParams.get("search")?.trim() || "",
    status: url.searchParams.get("status") || "",
    sortBy: url.searchParams.get("sortBy") || "createdAt",
    sortOrder: (url.searchParams.get("sortOrder") === "asc" ? "asc" : "desc"),
    startDate: url.searchParams.get("startDate") || "",
    endDate: url.searchParams.get("endDate") || "",
  };
}

export function getQueryParam(req: NextRequest, name: string): string | null {
  const url = new URL(req.url);
  return url.searchParams.get(name);
}

export function getQueryParamArray(req: NextRequest, name: string): string[] {
  const url = new URL(req.url);
  const value = url.searchParams.get(name);
  if (!value) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

// ============ PAGINATION HELPERS ============

export function getPaginationOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

export function buildPaginationMeta(total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ============ AUDIT LOG HELPERS ============

export type AuditAction =
  | "login"
  | "logout"
  | "password_change"
  | "create"
  | "update"
  | "delete"
  | "export"
  | "share"
  | "sign"
  | "payment"
  | "send"
  | "approve"
  | "reject";

export async function createAuditLog(
  userId: string,
  studioId: string | null,
  action: AuditAction,
  entity: string,
  entityId: string,
  metadata?: Record<string, unknown>,
  req?: NextRequest
): Promise<void> {
  try {
    const ip = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req?.headers.get("x-real-ip") 
      || "unknown";

    await db.insert(auditLogs).values({
      userId,
      studioId,
      action,
      entity,
      entityId,
      metadata: metadata || null,
      ipAddress: ip,
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to create audit log:", error);
  }
}

// ============ ERROR HELPERS ============

export function handleApiError(error: unknown): NextResponse {
  // Handle auth errors first
  if (error instanceof Error && error.name === "AuthError") {
    const status = (error as Error & { status?: number }).status || 401;
    return apiError(error.message, status);
  }

  console.error("API Error:", error);
  
  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0];
    return apiError(firstIssue?.message || "Dados inválidos", 422);
  }
  
  if (error instanceof Error) {
    // Check for specific database errors
    if (error.message.includes("unique constraint")) {
      return apiError("Registro duplicado", 409);
    }
    if (error.message.includes("foreign key")) {
      return apiError("Referência inválida", 400);
    }
    if (error.message.includes("not found")) {
      return apiError("Registro não encontrado", 404);
    }
    if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
      return apiError("Tempo de resposta excedido. Tente novamente.", 504);
    }
    if (error.message.includes("ECONNREFUSED")) {
      return apiError("Serviço indisponível. Tente novamente em instantes.", 503);
    }
  }
  
  return apiError("Erro interno do servidor", 500);
}

// ============ REQUEST HELPERS ============

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function getUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") || "unknown";
}

// ============ DATE HELPERS ============

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isDateInRange(date: Date, start?: Date, end?: Date): boolean {
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

// ============ STRING HELPERS ============

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML
    .slice(0, 10000); // Limit length
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============ ID HELPERS ============

export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function requireValidId(id: string | undefined): string {
  if (!id || !isValidUUID(id)) {
    throw new Error("ID inválido");
  }
  return id;
}

// ============ SERVER CACHE INVALIDATION ============

/**
 * Invalidate server-side cache for a studio's data.
 * Call this after any mutation (create, update, delete).
 */
export function invalidateStudioCache(studioId: string): void {
  serverCache.invalidate(`*${studioId}*`);
  serverCache.invalidate("analytics*");
  serverCache.invalidate("dashboard*");
}

/**
 * Invalidate all server-side cache.
 */
export function invalidateAllCache(): void {
  serverCache.clear();
}
