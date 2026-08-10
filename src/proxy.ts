import { NextRequest, NextResponse } from "next/server";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 120;

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (rateLimit.size > 10_000) {
    for (const [storedKey, value] of rateLimit) {
      if (now > value.resetAt) rateLimit.delete(storedKey);
    }
  }

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
  return { allowed: entry.count <= RATE_LIMIT_MAX, remaining };
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/health") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    const { allowed, remaining } = checkRateLimit(getRateLimitKey(request));
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Muitas requisições. Aguarde um momento." },
        { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Limit": String(RATE_LIMIT_MAX), "X-RateLimit-Remaining": "0" } },
      );
    }
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
