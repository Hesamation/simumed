import { createHmac, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME } from "@/lib/simumed/auth";

export const dynamic = "force-dynamic";

// Single-instance in-memory login rate limiting (the app runs one node).
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function passwordsMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && now <= entry.resetAt && entry.count >= MAX_ATTEMPTS) {
    return Response.json({ error: "too many attempts" }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password;
  } catch {
    password = "";
  }

  const expected = process.env.SIMUMED_APP_PASSWORD?.trim() ?? "";
  if (!expected || !password || !passwordsMatch(password, expected)) {
    attempts.set(ip, {
      count: (entry && now <= entry.resetAt ? entry.count : 0) + 1,
      resetAt: entry && now <= entry.resetAt ? entry.resetAt : now + WINDOW_MS,
    });
    return Response.json({ error: "invalid password" }, { status: 401 });
  }

  attempts.delete(ip);
  // Must match expectedToken() in auth.ts: HMAC-SHA256 hex over the salt.
  const token = createHmac("sha256", expected)
    .update("simumed-auth-v1")
    .digest("hex");
  const res = Response.json({ ok: true });
  // No Secure flag until TLS lands (domain step) — over plain HTTP the
  // browser would never send the cookie back and login could not succeed.
  res.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
  );
  return res;
}
