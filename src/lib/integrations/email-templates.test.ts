import { describe, it, expect } from "vitest";
import { getEmailTemplate } from "./email-templates";

describe("email-templates", () => {
  describe("password_reset", () => {
    it("subject menciona redefinição de senha e o estúdio", () => {
      const { subject } = getEmailTemplate("password_reset", {
        clientName: "Marina",
        studioName: "NoirFrame",
        resetLink: "https://noirframe.app/reset-password?token=abc123",
      });
      expect(subject.toLowerCase()).toContain("senha");
      expect(subject).toContain("NoirFrame");
    });

    it("html contém o link de redefinição e botão 'Redefinir Senha'", () => {
      const { html } = getEmailTemplate("password_reset", {
        clientName: "Marina",
        resetLink: "https://noirframe.app/reset-password?token=abc123",
      });
      expect(html).toContain("https://noirframe.app/reset-password?token=abc123");
      expect(html).toContain("Redefinir");
      expect(html).toContain("Marina");
    });
  });

  describe("gallery_ready", () => {
    it("html contém o link da galeria e botão de acesso", () => {
      const { subject, html } = getEmailTemplate("gallery_ready", {
        clientName: "João",
        galleryLink: "https://noirframe.app/gallery/casamento-joao",
      });
      expect(subject).toContain("fotos");
      expect(html).toContain("https://noirframe.app/gallery/casamento-joao");
      expect(html).toContain("Acessar Galeria");
    });
  });

  describe("shoot_reminder", () => {
    it("html contém data, hora e local do ensaio", () => {
      const { html } = getEmailTemplate("shoot_reminder", {
        clientName: "Ana",
        date: "15/08/2026",
        time: "15:00",
        location: "Fazenda Santa Maria",
      });
      expect(html).toContain("15/08/2026");
      expect(html).toContain("15:00");
      expect(html).toContain("Fazenda Santa Maria");
    });
  });
});
