import type { NextRequest } from "next/server";
import { llmConfig } from "./llm";
import { mockEnabled } from "./mock-brain";

export const COOKIE_NAME = "simumed_auth";
const TOKEN_SALT = "simumed-auth-v1";

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Deterministic session token: HMAC(password, salt). Same output in
 *  Edge (WebCrypto) and Node (createHmac with identical inputs). */
export async function expectedToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(TOKEN_SALT),
  );
  return toHex(sig);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function isAuthed(request: NextRequest): Promise<boolean> {
  const password = process.env.SIMUMED_APP_PASSWORD?.trim();
  if (!password) {
    return !llmConfig() && (process.env.NODE_ENV !== "production" || mockEnabled());
  }
  const got = request.cookies.get(COOKIE_NAME)?.value;
  if (!got) return false;
  const expected = await expectedToken(password);
  return constantTimeEqual(got, expected);
}

export function loginRedirectTarget(request: NextRequest): URL {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return url;
}
