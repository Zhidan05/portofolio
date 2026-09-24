import assert from "node:assert/strict";
import test from "node:test";
import { safeChannelUrl, validateContactSubmission } from "../lib/contactValidation.ts";

const settings = { max_message_length: 1024 };
const subjects = [{ value: "project" }, { value: "research" }];
const now = 2_000_000;
const valid = { name: "Ada Lovelace", email: "ada@example.com", subject: "project", message: "A useful project message.", company_website: "", initialized_at: now - 5_000 };

test("accepts a valid contact submission", () => {
  const result = validateContactSubmission(valid, settings, subjects, now);
  assert.equal(result.ok, true);
});
test("rejects missing or short names", () => assert.equal(validateContactSubmission({ ...valid, name: "" }, settings, subjects, now).ok, false));
test("rejects invalid email", () => assert.equal(validateContactSubmission({ ...valid, email: "not-an-email" }, settings, subjects, now).ok, false));
test("rejects disabled or unknown subjects", () => assert.equal(validateContactSubmission({ ...valid, subject: "disabled" }, settings, subjects, now).ok, false));
test("rejects short messages", () => assert.equal(validateContactSubmission({ ...valid, message: "short" }, settings, subjects, now).ok, false));
test("rejects oversized messages without truncating", () => assert.equal(validateContactSubmission({ ...valid, message: "x".repeat(1025) }, settings, subjects, now).ok, false));
test("rejects honeypot submissions", () => {
  const result = validateContactSubmission({ ...valid, company_website: "https://spam.example" }, settings, subjects, now);
  assert.equal(result.ok, false); assert.equal(result.spam, true);
});
test("rejects unrealistically fast submissions", () => {
  const result = validateContactSubmission({ ...valid, initialized_at: now - 200 }, settings, subjects, now);
  assert.equal(result.ok, false); assert.equal(result.spam, true);
});
test("allows only safe channel URL protocols", () => {
  assert.equal(safeChannelUrl("email", "ada@example.com", null), "mailto:ada@example.com");
  assert.match(safeChannelUrl("github", "Ada", "https://github.com/ada") || "", /^https:/);
  assert.throws(() => safeChannelUrl("website", "bad", "javascript:alert(1)"));
  assert.throws(() => safeChannelUrl("website", "bad", "data:text/html,bad"));
});
