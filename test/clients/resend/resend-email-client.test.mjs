import assert from "node:assert/strict";
import test from "node:test";

import { ResendEmailClient } from "../../../src/clients/resend/resend-email-client.mjs";
import { ResendProviderError } from "../../../src/clients/resend/exceptions/resend-provider-error.mjs";

const resumeRequest = { requestId: "request-123" };

function createClient(fetchClient) {
  return new ResendEmailClient({
    apiKey: "test-api-key",
    apiUrl: "https://api.resend.test/emails",
    from: "resend+sender@example.com",
    recipient: "recipient@example.com",
    subject: "Alguien descargó tu CV.",
    userAgent: "consumer/test",
    fetchClient,
  });
}

test("sends an idempotent notification", async () => {
  let request;
  const client = createClient(async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: "email-123" }),
    };
  });

  const emailId = await client.sendStoredNotification(resumeRequest);

  assert.equal(emailId, "email-123");
  assert.equal(request.url, "https://api.resend.test/emails");
  assert.equal(
    request.options.headers["Idempotency-Key"],
    "resume-request/request-123",
  );
  assert.equal(request.options.headers.Authorization, "Bearer test-api-key");
  assert.deepEqual(JSON.parse(request.options.body), {
    from: "resend+sender@example.com",
    to: ["recipient@example.com"],
    subject: "Alguien descargó tu CV.",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });
});

test("exposes a provider error without leaking the API key", async () => {
  const client = createClient(async () => ({
    ok: false,
    status: 403,
    json: async () => ({ message: "forbidden" }),
  }));

  await assert.rejects(
    () => client.sendStoredNotification(resumeRequest),
    (error) =>
      error instanceof ResendProviderError &&
      error.statusCode === 403 &&
      !error.message.includes("test-api-key"),
  );
});
