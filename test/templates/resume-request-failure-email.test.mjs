import assert from "node:assert/strict";
import test from "node:test";

import { createResumeRequestFailureReport } from "../../src/diagnostics/resume-request-failure-report.mjs";
import { createResumeRequestFailureEmail } from "../../src/templates/resume-request-failure-email.mjs";

test("renders a detailed brutalist error email without exposing unsafe HTML", () => {
  const error = Object.assign(new Error('<script>alert("failure")</script>'), {
    stage: "RESUME_DELIVERY",
    code: "ETIMEDOUT",
  });
  const report = createResumeRequestFailureReport({
    record: {
      messageId: "message-1\r\nBcc:attacker@example.com",
      body: '<img src=x onerror="alert(1)">',
      attributes: { ApproximateReceiveCount: "1" },
    },
    resumeRequest: null,
    error,
    lambdaContext: {
      functionName: "resume-consumer",
      awsRequestId: "lambda-request-1",
      logGroupName: "/aws/lambda/resume-consumer",
      logStreamName: "stream-1",
    },
    clock: () => new Date("2026-08-31T12:00:00.000Z"),
  });

  const content = createResumeRequestFailureEmail(report);

  assert.doesNotMatch(content.subject, /[\r\n]/);
  assert.match(content.subject, /^\[ERROR\] SQS\/Lambda/);
  assert.doesNotMatch(content.html, /<script>|<img src=x/);
  assert.match(content.html, /&lt;script&gt;alert\(&quot;failure&quot;\)/);
  assert.match(content.html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(content.html, /RESUME_DELIVERY/);
  assert.match(content.html, /batchItemFailures/);
  assert.match(content.html, /background-color:#F1EEE5/);
  assert.match(content.html, /background-color:#FF4D00/);
  assert.match(content.html, /background-color:#D9FF43/);
  assert.match(content.html, /background-color:#2457FF/);
  assert.match(content.html, /box-shadow:8px 8px 0 #B52E00/);
  assert.doesNotMatch(content.html, /linear-gradient|border-radius/i);
  assert.match(content.text, /CloudWatch log/);
  assert.match(content.text, /ETIMEDOUT/);
});
