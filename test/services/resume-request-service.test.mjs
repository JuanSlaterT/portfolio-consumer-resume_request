import assert from "node:assert/strict";
import test from "node:test";

import { DuplicateResumeRequestError } from "../../src/clients/aws/exceptions/duplicate-resume-request-error.mjs";
import { ResumeRequestService } from "../../src/services/resume-request-service.mjs";

const resumeRequest = {
  requestId: "request-123",
  email: "visitor@example.com",
  language: "es",
};
const logger = { info() {} };

test("stores, notifies the administrator, and then delivers the resume", async () => {
  const calls = [];
  let emailContext;
  const service = new ResumeRequestService({
    resumeRequestRepository: {
      store: async () => {
        calls.push("store");
        return "2026-08-30T20:44:00.000Z";
      },
    },
    emailClient: {
      sendStoredNotification: async (_resumeRequest, context) => {
        calls.push("notification");
        emailContext = context;
        return "notification-email-123";
      },
      sendResumeDelivery: async () => {
        calls.push("delivery");
        return "delivery-email-123";
      },
    },
    logger,
  });

  const result = await service.process(resumeRequest, { messageId: "message-1" });

  assert.deepEqual(calls, ["store", "notification", "delivery"]);
  assert.deepEqual(emailContext, {
    persistedAt: "2026-08-30T20:44:00.000Z",
  });
  assert.deepEqual(result, {
    requestId: "request-123",
    persistedAt: "2026-08-30T20:44:00.000Z",
    notificationEmailId: "notification-email-123",
    deliveryEmailId: "delivery-email-123",
  });
});

test("retries both emails when the request is already stored", async () => {
  const calls = [];
  const service = new ResumeRequestService({
    resumeRequestRepository: {
      store: async () => {
        throw new DuplicateResumeRequestError("request-123");
      },
    },
    emailClient: {
      sendStoredNotification: async () => {
        calls.push("notification");
        return "notification-email-123";
      },
      sendResumeDelivery: async () => {
        calls.push("delivery");
        return "delivery-email-123";
      },
    },
    logger,
  });

  const result = await service.process(resumeRequest, { messageId: "message-1" });

  assert.deepEqual(calls, ["notification", "delivery"]);
  assert.equal(result.persistedAt, null);
});

test("does not send emails when the database write fails", async () => {
  const calls = [];
  const service = new ResumeRequestService({
    resumeRequestRepository: {
      store: async () => {
        throw new Error("database unavailable");
      },
    },
    emailClient: {
      sendStoredNotification: async () => {
        calls.push("notification");
      },
      sendResumeDelivery: async () => {
        calls.push("delivery");
      },
    },
    logger,
  });

  await assert.rejects(
    () => service.process(resumeRequest, { messageId: "message-1" }),
    /database unavailable/,
  );
  assert.deepEqual(calls, []);
});

test("does not deliver the resume when the administrative notification fails", async () => {
  let deliveryCalls = 0;
  const service = new ResumeRequestService({
    resumeRequestRepository: {
      store: async () => "2026-08-30T20:44:00.000Z",
    },
    emailClient: {
      sendStoredNotification: async () => {
        throw new Error("administrative email unavailable");
      },
      sendResumeDelivery: async () => {
        deliveryCalls += 1;
      },
    },
    logger,
  });

  await assert.rejects(
    () => service.process(resumeRequest, { messageId: "message-1" }),
    /administrative email unavailable/,
  );
  assert.equal(deliveryCalls, 0);
});
