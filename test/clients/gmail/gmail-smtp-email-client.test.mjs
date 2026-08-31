import assert from "node:assert/strict";
import test from "node:test";

import { GmailSmtpEmailClient } from "../../../src/clients/gmail/gmail-smtp-email-client.mjs";

const resumeRequest = {
  requestId: "request-123",
  email: "visitor@example.com",
  requestedAt: "2026-08-30 15:43:35",
  ipHash: "sha-256-hash",
  language: "es",
  subscribeToUpdates: true,
};

function createClient(transporter) {
  return new GmailSmtpEmailClient({
    transporter,
    cloudfrontUrl: "https://assets.example.com",
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

test("delivers the Spanish CV to the email received from SQS", async () => {
  let message;
  const client = createClient({
    sendMail: async (mail) => {
      message = mail;
      return { messageId: "spanish-delivery@gmail.com" };
    },
  });

  const emailId = await client.sendResumeDelivery(resumeRequest);

  assert.equal(emailId, "spanish-delivery@gmail.com");
  assert.equal(message.to, "visitor@example.com");
  assert.match(message.subject, /Tu CV está listo/);
  assert.match(message.html, />Descargar CV/);
  assert.match(
    message.html,
    /https:\/\/assets\.example\.com\/CV_JUAN_AREVALO\.pdf/,
  );
  assert.equal(message.headers["X-Resume-Language"], "es");
});

test("delivers the English resume to the email received from SQS", async () => {
  let message;
  const client = createClient({
    sendMail: async (mail) => {
      message = mail;
      return { messageId: "english-delivery@gmail.com" };
    },
  });

  const emailId = await client.sendResumeDelivery({
    ...resumeRequest,
    language: "en",
  });

  assert.equal(emailId, "english-delivery@gmail.com");
  assert.equal(message.to, "visitor@example.com");
  assert.match(message.subject, /Your resume is ready/);
  assert.match(message.html, />Download Resume/);
  assert.match(
    message.html,
    /https:\/\/assets\.example\.com\/RESUME_JUAN_AREVALO\.pdf/,
  );
  assert.equal(message.headers["X-Resume-Language"], "en");
});

test("rejects an unsupported delivery language", async () => {
  const client = createClient({
    sendMail: async () => {
      throw new Error("sendMail should not be called");
    },
  });

  await assert.rejects(
    () =>
      client.sendResumeDelivery({
        ...resumeRequest,
        language: "fr",
      }),
    /Unsupported resume language: fr/,
  );
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
