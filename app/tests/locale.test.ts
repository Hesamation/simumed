import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  dir,
  isLocale,
  localeFromCookieHeader,
  otherLocale,
  pickLocale,
} from "../lib/i18n/config";
import { DICT, dictFor, dictLeafKeys } from "../lib/i18n/dict";
import { localeNum } from "../lib/i18n/format";

test("default locale is English (public default; flip line in config.ts)", () => {
  assert.equal(DEFAULT_LOCALE, "en");
});

test("isLocale accepts only en/fa", () => {
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("fa"), true);
  assert.equal(isLocale("de"), false);
  assert.equal(isLocale(undefined), false);
  assert.equal(isLocale("EN"), false);
});

test("dir: fa is rtl, en is ltr", () => {
  assert.equal(dir("fa"), "rtl");
  assert.equal(dir("en"), "ltr");
});

test("otherLocale toggles", () => {
  assert.equal(otherLocale("fa"), "en");
  assert.equal(otherLocale("en"), "fa");
});

test("localeFromCookieHeader parses the locale cookie only", () => {
  assert.equal(
    localeFromCookieHeader(`foo=bar; ${LOCALE_COOKIE}=fa; x=y`),
    "fa",
  );
  assert.equal(localeFromCookieHeader("foo=bar"), null);
  assert.equal(localeFromCookieHeader(null), null);
  assert.equal(localeFromCookieHeader(`${LOCALE_COOKIE}=de`), null);
});

test("pickLocale: explicit wins over cookie, cookie wins over default", () => {
  assert.equal(pickLocale("fa", `${LOCALE_COOKIE}=en`), "fa");
  assert.equal(pickLocale(undefined, `${LOCALE_COOKIE}=fa`), "fa");
  assert.equal(pickLocale(undefined, null), DEFAULT_LOCALE);
  assert.equal(pickLocale("de", `${LOCALE_COOKIE}=fa`), "fa");
});

test("locale completeness: en and fa expose exactly the same key tree", () => {
  const enKeys = dictLeafKeys(DICT.en);
  const faKeys = dictLeafKeys(DICT.fa);
  assert.ok(enKeys.length > 100, "dictionary must be substantial");
  assert.deepEqual(
    faKeys.filter((k) => !enKeys.includes(k)),
    [],
    "fa keys missing from en",
  );
  assert.deepEqual(
    enKeys.filter((k) => !faKeys.includes(k)),
    [],
    "en keys missing from fa",
  );
});

test("fa strings are preserved verbatim (spot checks)", () => {
  const fa = dictFor("fa");
  assert.equal(fa.chat.placeholder, "سؤالت را از بیمار بپرس…");
  assert.equal(fa.scene.admit, "ورود بیمار");
  assert.equal(fa.app.subtitle, "شبیه‌ساز مصاحبه بالینی با بیمار مجازی");
  assert.equal(fa.login.errorWrong, "گذرواژه درست نیست.");
  assert.equal(fa.manifest.name, "سیمومد | شبیه‌ساز مصاحبه بالینی");
  assert.equal(fa.s.ack, "چشم.");
  assert.equal(
    fa.review.verdict(90),
    "عملکرد عالی — همین مسیر را ادامه بده",
  );
});

test("en strings are natural clinical English (spot checks)", () => {
  const en = dictFor("en");
  assert.equal(en.chat.placeholder, "Ask the patient a question…");
  assert.equal(en.scene.admit, "Patient arrival");
  assert.equal(en.review.errs.critical.label, "Critical");
  assert.equal(en.review.verdict(90), "Excellent performance — keep this up");
});

test("localeNum: Persian digits and decimal mark in fa; passthrough in en", () => {
  assert.equal(localeNum("fa", 38.4), "۳۸٫۴");
  assert.equal(localeNum("fa", "12"), "۱۲");
  assert.equal(localeNum("en", 38.4), "38.4");
  assert.equal(localeNum("en", "86%"), "86%");
});
