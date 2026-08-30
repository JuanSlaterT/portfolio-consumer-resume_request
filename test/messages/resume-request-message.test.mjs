import assert from "node:assert/strict";
import test from "node:test";

import { parseResumeRequest } from "../../src/messages/resume-request-message.mjs";

test("parses the resume request producer contract", () => {
  const body = JSON.stringify({
    requestId: "0198f4f1-0be8-7000-8000-000000000001",
    requestedAt: "2026-08-30 15:43:35",
    ipHash: "hash-recibido",
    email: "user@example.com",
    subscribeToUpdates: true,
    timestamp: 1788122615000,
  });

  assert.deepEqual(parseResumeRequest(body), JSON.parse(body));
});

test("rejects malformed JSON", () => {
  assert.throws(
    () => parseResumeRequest("{"),
    /message body must be valid JSON/,
  );
});

test("rejects a non-object JSON body", () => {
  assert.throws(
    () => parseResumeRequest("[]"),
    /message body must be a JSON object/,
  );
});
