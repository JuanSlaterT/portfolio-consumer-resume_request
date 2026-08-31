import assert from "node:assert/strict";
import test from "node:test";

import { loadConfig } from "../../src/config/environment.mjs";

test("loads required values and notification defaults", () => {
  const config = loadConfig({
    DYNAMODB_TABLE_NAME: "resume-requests",
    GMAIL_SMTP_APP_PASSWORD: "test-app-password",
  });

  assert.equal(config.dynamodb.tableName, "resume-requests");
  assert.equal(config.gmailSmtp.host, "smtp.gmail.com");
  assert.equal(config.gmailSmtp.port, 465);
  assert.equal(config.gmailSmtp.secure, true);
  assert.equal(config.gmailSmtp.user, "arevalobernaljuan@gmail.com");
  assert.equal(config.gmailSmtp.appPassword, "test-app-password");
  assert.equal(config.notification.from, "arevalobernaljuan@gmail.com");
  assert.equal(
    config.notification.recipient,
    "arevalobernaljuan+portfolio@gmail.com",
  );
  assert.equal(config.notification.subject, "Alguien descargó tu CV.");
});

test("fails fast when the Gmail app password is absent", () => {
  assert.throws(
    () =>
      loadConfig({
        DYNAMODB_TABLE_NAME: "resume-requests",
      }),
    /GMAIL_SMTP_APP_PASSWORD is required/,
  );
});
