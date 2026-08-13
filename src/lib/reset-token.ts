import { randomBytes, createHash } from "crypto";

/**
 * Token de redefinição de senha — utilitários puros (sem DB) para
 * gerar, armazenar (hash) e validar expiração de tokens.
 */

/** Tempo de vida do token de reset: 1 hora */
export const RESET_TOKEN_TTL_MS = 3600_000;

/** Gera um token aleatório seguro (32 bytes, base64url) */
export function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Hash SHA-256 do token (hex) — só o hash é persistido no banco */
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Verifica se o token expirou */
export function isResetTokenExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}
