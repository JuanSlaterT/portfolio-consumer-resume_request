import assert from "node:assert/strict";
import test from "node:test";

import { GmailSmtpEmailClient } from "../../../src/clients/gmail/gmail-smtp-email-client.mjs";

const resumeRequest = { requestId: "request-123" };

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

  const emailId = await client.sendStoredNotification(resumeRequest);

  assert.equal(emailId, "message-id-123@gmail.com");
  assert.deepEqual(message, {
    from: "sender@gmail.com",
    to: "recipient+portfolio@gmail.com",
    subject: "Alguien descargó tu CV.",
    text: "Se guardó una nueva solicitud de descarga de tu CV.",
    html: "<p>Se guardó una nueva solicitud de descarga de tu <strong>CV</strong>.</p>",
    headers: {
      "X-Resume-Request-Id": "request-123",
    },
  });
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
