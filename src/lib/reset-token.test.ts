import { describe, it, expect } from "vitest";
import {
  generateResetToken,
  hashResetToken,
  isResetTokenExpired,
  RESET_TOKEN_TTL_MS,
} from "./reset-token";

describe("reset-token", () => {
  it("gera token aleatório em base64url com pelo menos 43 caracteres (32 bytes)", () => {
    const token = generateResetToken();
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThanOrEqual(43);
    // base64url alphabet: A-Z a-z 0-9 - _
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("gera tokens diferentes em chamadas sucessivas", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a).not.toBe(b);
  });

  it("hashResetToken produz hex SHA-256 de 64 caracteres, determinístico", () => {
    const token = "token-de-teste-123";
    const h1 = hashResetToken(token);
    const h2 = hashResetToken(token);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(h1).toBe(h2);
  });

  it("hashes diferentes para tokens diferentes", () => {
    expect(hashResetToken("abc")).not.toBe(hashResetToken("abd"));
  });

  it("isResetTokenExpired retorna true para data no passado", () => {
    expect(isResetTokenExpired(new Date(Date.now() - 1000))).toBe(true);
  });

  it("isResetTokenExpired retorna false para data no futuro", () => {
    expect(isResetTokenExpired(new Date(Date.now() + 60_000))).toBe(false);
  });

  it("TTL de expiração é de 1 hora", () => {
    expect(RESET_TOKEN_TTL_MS).toBe(3600_000);
  });
});
