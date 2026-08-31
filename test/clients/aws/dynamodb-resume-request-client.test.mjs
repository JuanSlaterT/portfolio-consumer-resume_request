import assert from "node:assert/strict";
import test from "node:test";

import { DynamoDbResumeRequestClient } from "../../../src/clients/aws/dynamodb-resume-request-client.mjs";
import { DuplicateResumeRequestError } from "../../../src/clients/aws/exceptions/duplicate-resume-request-error.mjs";

const resumeRequest = {
  requestId: "0198f4f1-0be8-7000-8000-000000000001",
  requestedAt: "2026-08-30 15:43:35",
  ipHash: "hash-recibido",
  email: "user@example.com",
  language: "es",
  subscribeToUpdates: true,
  timestamp: 1788122615000,
};

test("stores the DynamoDB item with a Lambda-generated ISO timestamp", async () => {
  let command;
  const client = new DynamoDbResumeRequestClient({
    dynamodb: {
      send: async (receivedCommand) => {
        command = receivedCommand;
      },
    },
    tableName: "resume-requests",
    clock: () => new Date("2026-08-30T20:44:00.000Z"),
  });

  const persistedAt = await client.store(resumeRequest);

  assert.equal(persistedAt, "2026-08-30T20:44:00.000Z");
  assert.deepEqual(command.input, {
    TableName: "resume-requests",
    Item: {
      requestId: { S: resumeRequest.requestId },
      email: { S: resumeRequest.email },
      requestedAt: { S: resumeRequest.requestedAt },
      ipHash: { S: resumeRequest.ipHash },
      language: { S: resumeRequest.language },
      subscribeToUpdates: { BOOL: true },
      timestamp: { S: "2026-08-30T20:44:00.000Z" },
    },
    ConditionExpression: "attribute_not_exists(requestId)",
  });
});

test("translates a conditional write failure into a duplicate error", async () => {
  const providerError = new Error("duplicate");
  providerError.name = "ConditionalCheckFailedException";

  const client = new DynamoDbResumeRequestClient({
    dynamodb: { send: async () => Promise.reject(providerError) },
    tableName: "resume-requests",
  });

  await assert.rejects(
    () => client.store(resumeRequest),
    DuplicateResumeRequestError,
  );
});
