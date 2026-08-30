import assert from "node:assert/strict";
import test from "node:test";

import { loadConfig } from "../../src/config/environment.mjs";

test("loads required values and notification defaults", () => {
  const config = loadConfig({
    DYNAMODB_TABLE_NAME: "resume-requests",
    RESEND_API_KEY: "test-key",
    RESEND_API_URL: "https://api.resend.test/emails",
  });

  assert.equal(config.dynamodb.tableName, "resume-requests");
  assert.equal(config.resend.apiKey, "test-key");
  assert.equal(config.resend.apiUrl, "https://api.resend.test/emails");
  assert.equal(config.resend.from, "resend+arevalobernaljuan@gmail.com");
  assert.equal(config.resend.recipient, "arevalobernaljuan@gmail.com");
  assert.equal(config.resend.subject, "Alguien descargó tu CV.");
});

test("fails fast when sensitive configuration is absent", () => {
  assert.throws(
    () =>
      loadConfig({
        DYNAMODB_TABLE_NAME: "resume-requests",
        RESEND_API_URL: "https://api.resend.test/emails",
      }),
    /RESEND_API_KEY is required/,
  );
});

test("fails fast when the Resend URL is absent", () => {
  assert.throws(
    () =>
      loadConfig({
        DYNAMODB_TABLE_NAME: "resume-requests",
        RESEND_API_KEY: "test-key",
      }),
    /RESEND_API_URL is required/,
  );
});
