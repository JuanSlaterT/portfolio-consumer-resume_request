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
