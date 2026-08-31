import assert from "node:assert/strict";
import test from "node:test";

import { MailjetEmailClient } from "../../../src/clients/mailjet/mailjet-email-client.mjs";
import { MailjetProviderError } from "../../../src/clients/mailjet/exceptions/mailjet-provider-error.mjs";

const resumeRequest = { requestId: "request-123" };

function createClient(fetchClient) {
  return new MailjetEmailClient({
    apiKey: "test-api-key",
    apiSecret: "test-api-secret",
    apiUrl: "https://api.mailjet.test/v3.1/send",
    from: "sender@example.com",
    recipient: "recipient@example.com",
    subject: "Alguien descargó tu CV.",
    userAgent: "consumer/test",
    fetchClient,
  });
}

test("sends a Mailjet notification correlated with the resume request", async () => {
  let request;
  const client = createClient(async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({
        Messages: [
          {
            Status: "success",
            To: [{ MessageUUID: "message-uuid-123" }],
          },
        ],
      }),
    };
  });

  const emailId = await client.sendStoredNotification(resumeRequest);

  assert.equal(emailId, "message-uuid-123");
  assert.equal(request.url, "https://api.mailjet.test/v3.1/send");
  assert.equal(
    request.options.headers.Authorization,
    `Basic ${Buffer.from("test-api-key:test-api-secret").toString("base64")}`,
  );
  assert.deepEqual(JSON.parse(request.options.body), {
    Messages: [
      {
        From: { Email: "sender@example.com" },
        To: [{ Email: "recipient@example.com" }],
        Subject: "Alguien descargó tu CV.",
        HTMLPart:
          "<p>Se guardó una nueva solicitud de descarga de tu <strong>CV</strong>.</p>",
        CustomID: "request-123",
      },
    ],
  });
});

test("exposes an HTTP provider error without leaking either API credential", async () => {
  const client = createClient(async () => ({
    ok: false,
    status: 401,
    json: async () => ({ ErrorMessage: "Unauthorized" }),
  }));

  await assert.rejects(
    () => client.sendStoredNotification(resumeRequest),
    (error) =>
      error instanceof MailjetProviderError &&
      error.statusCode === 401 &&
      !error.message.includes("test-api-key") &&
      !error.message.includes("test-api-secret"),
  );
});

test("rejects a message-level Mailjet failure returned with HTTP 200", async () => {
  const client = createClient(async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      Messages: [
        {
          Status: "error",
          Errors: [{ ErrorMessage: "Sender address is not verified" }],
        },
      ],
    }),
  }));

  await assert.rejects(
    () => client.sendStoredNotification(resumeRequest),
    (error) =>
      error instanceof MailjetProviderError &&
      error.message.includes("Sender address is not verified"),
  );
});
