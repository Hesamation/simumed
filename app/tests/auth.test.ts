import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { expectedToken } from "../lib/simumed/auth";

test("expectedToken is deterministic for the same password", async () => {
  const a = await expectedToken("correct horse battery staple");
  const b = await expectedToken("correct horse battery staple");
  assert.equal(a, b);
});

test("expectedToken matches the Node login-route computation (HMAC-SHA256 over the salt)", async () => {
  const password = "simumed-demo";
  const webCryptoToken = await expectedToken(password);
  const nodeToken = createHmac("sha256", password)
    .update("simumed-auth-v1")
    .digest("hex");
  assert.equal(webCryptoToken, nodeToken);
});

test("expectedToken differs per password", async () => {
  const a = await expectedToken("one");
  const b = await expectedToken("two");
  assert.notEqual(a, b);
});

test("expectedToken is a 64-char hex string", async () => {
  const t = await expectedToken("x");
  assert.match(t, /^[0-9a-f]{64}$/);
});
