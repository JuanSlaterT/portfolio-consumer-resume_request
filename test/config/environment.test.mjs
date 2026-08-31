import assert from "node:assert/strict";
import test from "node:test";

import { loadConfig } from "../../src/config/environment.mjs";

test("loads required values and notification defaults", () => {
  const config = loadConfig({
    DYNAMODB_TABLE_NAME: "resume-requests",
    MAILJET_API_KEY: "test-key",
    MAILJET_SECRET_KEY: "test-secret",
    MAILJET_API_URL: "https://api.mailjet.test/v3.1/send",
  });

  assert.equal(config.dynamodb.tableName, "resume-requests");
  assert.equal(config.mailjet.apiKey, "test-key");
  assert.equal(config.mailjet.apiSecret, "test-secret");
  assert.equal(config.mailjet.apiUrl, "https://api.mailjet.test/v3.1/send");
  assert.equal(config.mailjet.from, "arevalobernaljuan@gmail.com");
  assert.equal(config.mailjet.recipient, "arevalobernaljuan@gmail.com");
  assert.equal(config.mailjet.subject, "Alguien descargó tu CV.");
});

test("fails fast when sensitive configuration is absent", () => {
  assert.throws(
    () =>
      loadConfig({
        DYNAMODB_TABLE_NAME: "resume-requests",
        MAILJET_SECRET_KEY: "test-secret",
        MAILJET_API_URL: "https://api.mailjet.test/v3.1/send",
      }),
    /MAILJET_API_KEY is required/,
  );
});

test("fails fast when the Mailjet secret is absent", () => {
  assert.throws(
    () =>
      loadConfig({
        DYNAMODB_TABLE_NAME: "resume-requests",
        MAILJET_API_KEY: "test-key",
        MAILJET_API_URL: "https://api.mailjet.test/v3.1/send",
      }),
    /MAILJET_SECRET_KEY is required/,
  );
});

test("fails fast when the Mailjet URL is absent", () => {
  assert.throws(
    () =>
      loadConfig({
        DYNAMODB_TABLE_NAME: "resume-requests",
        MAILJET_API_KEY: "test-key",
        MAILJET_SECRET_KEY: "test-secret",
      }),
    /MAILJET_API_URL is required/,
  );
});
