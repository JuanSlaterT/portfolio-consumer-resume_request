import assert from "node:assert/strict";
import test from "node:test";

import { createResumeRequestHandler } from "../../src/handlers/resume-request-handler.mjs";

test("returns only failed SQS records in the partial batch response", async () => {
  const processedIds = [];
  const handler = createResumeRequestHandler({
    resumeRequestService: {
      process: async (request) => {
        processedIds.push(request.requestId);
        if (request.requestId === "failed-request") {
          throw new Error("provider unavailable");
        }
      },
    },
    logger: { error() {} },
  });

  const result = await handler({
    Records: [
      {
        messageId: "message-1",
        body: JSON.stringify({ requestId: "successful-request" }),
      },
      {
        messageId: "message-2",
        body: JSON.stringify({ requestId: "failed-request" }),
      },
    ],
  });

  assert.deepEqual(processedIds, ["successful-request", "failed-request"]);
  assert.deepEqual(result, {
    batchItemFailures: [{ itemIdentifier: "message-2" }],
  });
});

test("emails the structured diagnostic before the first failed record is retried", async () => {
  const logEntries = [];
  let emailedReport;
  const processingError = Object.assign(new Error("provider unavailable"), {
    stage: "RESUME_DELIVERY",
    code: "ETIMEDOUT",
  });
  const handler = createResumeRequestHandler({
    resumeRequestService: {
      process: async () => {
        throw processingError;
      },
    },
    failureEmailClient: {
      sendProcessingFailure: async (report) => {
        emailedReport = report;
        return "failure-email-123";
      },
    },
    logger: {
      error(message, details) {
        logEntries.push({ level: "error", message, details });
      },
      info(message, details) {
        logEntries.push({ level: "info", message, details });
      },
    },
    clock: () => new Date("2026-08-31T12:00:00.000Z"),
  });

  const result = await handler(
    {
      Records: [
        {
          messageId: "message-1",
          body: JSON.stringify({
            requestId: "request-1",
            email: "visitor@example.com",
          }),
          eventSourceARN: "arn:aws:sqs:us-east-1:123:resume-requests",
          awsRegion: "us-east-1",
          attributes: { ApproximateReceiveCount: "1" },
        },
      ],
    },
    {
      functionName: "resume-consumer",
      functionVersion: "$LATEST",
      awsRequestId: "lambda-request-1",
      logGroupName: "/aws/lambda/resume-consumer",
      logStreamName: "stream-1",
      getRemainingTimeInMillis: () => 20_000,
    },
  );

  assert.deepEqual(result, {
    batchItemFailures: [{ itemIdentifier: "message-1" }],
  });
  assert.equal(emailedReport.stage, "RESUME_DELIVERY");
  assert.equal(emailedReport.requestId, "request-1");
  assert.equal(emailedReport.exception.code, "ETIMEDOUT");
  assert.equal(emailedReport.logStreamName, "stream-1");
  assert.equal(emailedReport.firstFailure, true);
  assert.equal(logEntries[0].message, "Resume request processing failed");
  assert.equal(logEntries[0].details, emailedReport);
  assert.equal(logEntries[1].message, "Processing failure email sent");
});

test("logs every retry but sends the diagnostic email only on the first attempt", async () => {
  let failureEmailCalls = 0;
  let failureLogCalls = 0;
  const handler = createResumeRequestHandler({
    resumeRequestService: {
      process: async () => {
        throw new Error("still unavailable");
      },
    },
    failureEmailClient: {
      sendProcessingFailure: async () => {
        failureEmailCalls += 1;
      },
    },
    logger: {
      error() {
        failureLogCalls += 1;
      },
    },
  });

  const result = await handler({
    Records: [
      {
        messageId: "message-retry",
        body: JSON.stringify({ requestId: "request-retry" }),
        attributes: { ApproximateReceiveCount: "2" },
      },
    ],
  });

  assert.deepEqual(result, {
    batchItemFailures: [{ itemIdentifier: "message-retry" }],
  });
  assert.equal(failureLogCalls, 1);
  assert.equal(failureEmailCalls, 0);
});

test("preserves the original SQS failure when the diagnostic email also fails", async () => {
  const errors = [];
  const handler = createResumeRequestHandler({
    resumeRequestService: {
      process: async () => {
        throw new Error("database unavailable");
      },
    },
    failureEmailClient: {
      sendProcessingFailure: async () => {
        throw Object.assign(new Error("SMTP unavailable"), { code: "ECONNRESET" });
      },
    },
    logger: {
      error(message, details) {
        errors.push({ message, details });
      },
    },
  });

  const result = await handler({
    Records: [
      {
        messageId: "message-1",
        body: JSON.stringify({ requestId: "request-1" }),
        attributes: { ApproximateReceiveCount: "1" },
      },
    ],
  });

  assert.deepEqual(result, {
    batchItemFailures: [{ itemIdentifier: "message-1" }],
  });
  assert.equal(errors.length, 2);
  assert.equal(errors[1].message, "Processing failure email could not be sent");
  assert.equal(errors[1].details.notificationException.code, "ECONNRESET");
});
