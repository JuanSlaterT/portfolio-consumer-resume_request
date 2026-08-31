import assert from "node:assert/strict";
import test from "node:test";

import { DuplicateResumeRequestError } from "../../src/clients/aws/exceptions/duplicate-resume-request-error.mjs";
import { ResumeRequestService } from "../../src/services/resume-request-service.mjs";

const resumeRequest = { requestId: "request-123" };
const logger = { info() {} };

test("stores the request before sending the notification", async () => {
  const calls = [];
  const service = new ResumeRequestService({
    resumeRequestRepository: {
      store: async () => {
        calls.push("store");
        return "2026-08-30T20:44:00.000Z";
      },
    },
    emailClient: {
      sendStoredNotification: async () => {
        calls.push("email");
        return "email-123";
      },
    },
    logger,
  });

  const result = await service.process(resumeRequest, { messageId: "message-1" });

  assert.deepEqual(calls, ["store", "email"]);
  assert.deepEqual(result, {
    requestId: "request-123",
    persistedAt: "2026-08-30T20:44:00.000Z",
    emailId: "email-123",
  });
});

test("retries the notification when the request is already stored", async () => {
  let emailCalls = 0;
  const service = new ResumeRequestService({
    resumeRequestRepository: {
      store: async () => {
        throw new DuplicateResumeRequestError("request-123");
      },
    },
    emailClient: {
      sendStoredNotification: async () => {
        emailCalls += 1;
        return "email-123";
      },
    },
    logger,
  });

  const result = await service.process(resumeRequest, { messageId: "message-1" });

  assert.equal(emailCalls, 1);
  assert.equal(result.persistedAt, null);
});

test("does not send an email when the database write fails", async () => {
  let emailCalls = 0;
  const service = new ResumeRequestService({
    resumeRequestRepository: {
      store: async () => {
        throw new Error("database unavailable");
      },
    },
    emailClient: {
      sendStoredNotification: async () => {
        emailCalls += 1;
      },
    },
    logger,
  });

  await assert.rejects(
    () => service.process(resumeRequest, { messageId: "message-1" }),
    /database unavailable/,
  );
  assert.equal(emailCalls, 0);
});
