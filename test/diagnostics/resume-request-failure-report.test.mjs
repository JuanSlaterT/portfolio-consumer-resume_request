import assert from "node:assert/strict";
import test from "node:test";

import { createResumeRequestFailureReport } from "../../src/diagnostics/resume-request-failure-report.mjs";
import { ResumeRequestProcessingError } from "../../src/exceptions/resume-request-processing-error.mjs";

test("builds a serializable Lambda and SQS failure report with the cause chain", () => {
  const providerError = Object.assign(new Error("DynamoDB unavailable"), {
    name: "ServiceUnavailableException",
    code: "ThrottlingException",
    retryable: true,
    $metadata: { httpStatusCode: 503 },
  });
  const error = new ResumeRequestProcessingError(
    "DYNAMODB_PERSISTENCE",
    providerError,
  );

  const report = createResumeRequestFailureReport({
    record: {
      messageId: "sqs-message-123",
      body: '{"requestId":"request-123"}',
      eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:resume-requests",
      awsRegion: "us-east-1",
      attributes: {
        ApproximateReceiveCount: "1",
        SentTimestamp: "1788150000000",
        ApproximateFirstReceiveTimestamp: "1788150001000",
      },
    },
    resumeRequest: {
      requestId: "request-123",
      email: "visitor@example.com",
    },
    error,
    lambdaContext: {
      functionName: "resume-request-consumer",
      functionVersion: "$LATEST",
      awsRequestId: "lambda-request-456",
      logGroupName: "/aws/lambda/resume-request-consumer",
      logStreamName: "2026/08/31/[$LATEST]stream",
      getRemainingTimeInMillis: () => 24_500,
    },
    clock: () => new Date("2026-08-31T12:00:00.000Z"),
  });

  assert.equal(report.failedAt, "2026-08-31T12:00:00.000Z");
  assert.equal(report.stage, "DYNAMODB_PERSISTENCE");
  assert.equal(report.receiveCount, 1);
  assert.equal(report.firstFailure, true);
  assert.equal(report.messageId, "sqs-message-123");
  assert.equal(report.requestId, "request-123");
  assert.equal(report.awsRequestId, "lambda-request-456");
  assert.equal(report.remainingTimeInMillis, 24_500);
  assert.match(report.payloadSnapshot, /visitor@example\.com/);
  assert.equal(report.exception.name, "ResumeRequestProcessingError");
  assert.equal(report.exception.cause.name, "ServiceUnavailableException");
  assert.equal(report.exception.cause.code, "ThrottlingException");
  assert.equal(report.exception.cause.statusCode, "503");
  assert.equal(report.exception.cause.retryable, "true");
  assert.doesNotThrow(() => JSON.stringify(report));
});

test("classifies malformed messages and limits the payload snapshot", () => {
  const report = createResumeRequestFailureReport({
    record: {
      messageId: "malformed-message",
      body: "x".repeat(5_000),
      attributes: { ApproximateReceiveCount: "3" },
    },
    resumeRequest: null,
    error: new Error("message body must be valid JSON"),
    lambdaContext: {},
  });

  assert.equal(report.stage, "SQS_MESSAGE_PARSE");
  assert.equal(report.receiveCount, 3);
  assert.equal(report.firstFailure, false);
  assert.match(report.payloadSnapshot, /\[truncated\]$/);
});
