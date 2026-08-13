import { describe, it, expect } from "vitest";
import { PLANS } from "./constants";

describe("PLANS — estratégia de preço R$ 37,90", () => {
  it("existe um plano principal 'completo'", () => {
    expect(PLANS.completo).toBeDefined();
  });

  it("preço mensal é R$ 37,90", () => {
    expect(PLANS.completo.price).toBe(37.9);
  });

  it("preço anual é R$ 379 (2 meses grátis vs mensal)", () => {
    expect(PLANS.completo.priceYearly).toBe(379);
    expect(PLANS.completo.priceYearly).toBeLessThan(PLANS.completo.price * 12);
  });

  it("anual equivale a ~R$ 31,58/mês", () => {
    const perMonth = PLANS.completo.priceYearly / 12;
    expect(perMonth).toBeCloseTo(31.58, 1);
  });

  it("limites são ilimitados (acesso completo)", () => {
    const l = PLANS.completo.limits;
    expect(l.clientsPerMonth).toBe(-1);
    expect(l.activeGalleries).toBe(-1);
    expect(l.teamMembers).toBe(-1);
    expect(l.storageGb).toBeGreaterThanOrEqual(1000);
  });

  it("features cobrem todos os módulos do produto", () => {
    const features = PLANS.completo.features.join(" ").toLowerCase();
    const requiredModules = [
      "assistente", "agenda", "crm", "galeria", "proposta",
      "contrato", "financeiro", "blog", "portfólio", "tarefa",
      "mensagens", "automações", "analytics", "cliente", "segurança",
      "domínio",
    ];
    for (const feature of requiredModules) {
      expect(features).toContain(feature);
    }
  });

  it("todos os planos cadastrados custam R$ 37,90/mês", () => {
    const plans = Object.values(PLANS);
    expect(plans.length).toBeGreaterThanOrEqual(1);
    for (const p of plans) {
      expect(p.price).toBe(37.9);
    }
  });
});
