import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendEmail, isEmailEnabled, getFromAddress, getAppUrl } from "./email-sender";

describe("email-sender", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("isEmailEnabled retorna false sem RESEND_API_KEY", () => {
    expect(isEmailEnabled()).toBe(false);
  });

  it("isEmailEnabled retorna true com RESEND_API_KEY", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    expect(isEmailEnabled()).toBe(true);
  });

  it("getFromAddress usa default do Resend sem EMAIL_FROM", () => {
    expect(getFromAddress()).toContain("onboarding@resend.dev");
  });

  it("getFromAddress respeita EMAIL_FROM configurado", () => {
    process.env.EMAIL_FROM = "Studio <contato@noirframe.com>";
    expect(getFromAddress()).toBe("Studio <contato@noirframe.com>");
  });

  it("getAppUrl usa default noirframe.app sem NEXT_PUBLIC_APP_URL", () => {
    expect(getAppUrl()).toBe("https://noirframe.app");
  });

  it("modo dev: sem chave, não lança, não chama fetch, retorna mode dev", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendEmail({
      to: "cliente@email.com",
      template: "gallery_ready",
      vars: { clientName: "Maria", galleryLink: "https://noirframe.app/g/x" },
    });

    expect(result.mode).toBe("dev");
    expect(result.sent).toBe(false);
    expect(result.to).toBe("cliente@email.com");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("modo resend: com chave, chama API do Resend com payload correto", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "NoirFrame <contato@noirframe.com>";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ id: "email-123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendEmail({
      to: "cliente@email.com",
      template: "gallery_ready",
      vars: { clientName: "Maria", galleryLink: "https://noirframe.app/g/x" },
    });

    expect(result.mode).toBe("resend");
    expect(result.sent).toBe(true);
    expect(result.id).toBe("email-123");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("api.resend.com");
    const body = JSON.parse(init.body);
    expect(body.from).toBe("NoirFrame <contato@noirframe.com>");
    expect(body.to).toContain("cliente@email.com");
    expect(body.subject).toBeTruthy();
    expect(body.html).toContain("Acessar Galeria");
  });

  it("modo resend: erro da API lança com contexto do status", async () => {
    process.env.RESEND_API_KEY = "re_test_key";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: async () => "missing domain",
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      sendEmail({
        to: "cliente@email.com",
        template: "welcome",
        vars: { clientName: "Maria" },
      })
    ).rejects.toThrow(/401/);
  });
});
