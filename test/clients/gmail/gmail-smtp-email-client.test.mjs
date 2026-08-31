import assert from "node:assert/strict";
import test from "node:test";

import { GmailSmtpEmailClient } from "../../../src/clients/gmail/gmail-smtp-email-client.mjs";

const resumeRequest = {
  requestId: "request-123",
  email: "visitor@example.com",
  requestedAt: "2026-08-30 15:43:35",
  ipHash: "sha-256-hash",
  subscribeToUpdates: true,
};

function createClient(transporter) {
  return new GmailSmtpEmailClient({
    transporter,
    from: "sender@gmail.com",
    recipient: "recipient+portfolio@gmail.com",
    subject: "Alguien descargó tu CV.",
  });
}

test("sends a Gmail SMTP notification correlated with the resume request", async () => {
  let message;
  const client = createClient({
    sendMail: async (mail) => {
      message = mail;
      return { messageId: "message-id-123@gmail.com" };
    },
  });

  const emailId = await client.sendStoredNotification(resumeRequest, {
    persistedAt: "2026-08-30T20:43:36.000Z",
  });

  assert.equal(emailId, "message-id-123@gmail.com");
  assert.equal(message.from, "sender@gmail.com");
  assert.equal(message.to, "recipient+portfolio@gmail.com");
  assert.equal(message.subject, "Alguien descargó tu CV.");
  assert.equal(message.headers["X-Resume-Request-Id"], "request-123");
  assert.match(message.text, /visitor@example\.com/);
  assert.match(message.text, /2026-08-30T20:43:36\.000Z/);
  assert.match(message.html, /Nueva solicitud de descarga de CV/);
  assert.match(message.html, /visitor@example\.com/);
  assert.match(message.html, /DynamoDB/);
});

test("propagates SMTP errors so SQS can retry the record", async () => {
  const smtpError = Object.assign(new Error("SMTP authentication failed"), {
    code: "EAUTH",
    responseCode: 535,
  });
  const client = createClient({
    sendMail: async () => {
      throw smtpError;
    },
  });

  await assert.rejects(
    () => client.sendStoredNotification(resumeRequest),
    (error) => error === smtpError,
  );
});
