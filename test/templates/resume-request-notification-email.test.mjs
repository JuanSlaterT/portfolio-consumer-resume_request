import assert from "node:assert/strict";
import test from "node:test";

import { createResumeRequestNotificationEmail } from "../../src/templates/resume-request-notification-email.mjs";

test("renders the persisted SQS request in HTML and plain text", () => {
  const content = createResumeRequestNotificationEmail(
    {
      requestId: "0198f3d4-7b3a-7000-8000-123456789abc",
      email: "visitor@example.com",
      requestedAt: "2026-08-30 15:43:35",
      ipHash: "abc123hash",
      subscribeToUpdates: true,
    },
    { persistedAt: "2026-08-30T20:43:36.000Z" },
  );

  assert.match(content.html, /visitor@example\.com/);
  assert.match(content.html, /2026-08-30T20:43:36\.000Z/);
  assert.match(content.html, /abc123hash/);
  assert.match(content.html, /Actualizaciones/);
  assert.match(content.html, />Sí</);
  assert.match(content.text, /La información de la solicitud fue confirmada/);
});

test("uses the brutalist editorial visual system", () => {
  const content = createResumeRequestNotificationEmail({
    requestId: "request-01",
    email: "visitor@example.com",
    requestedAt: "2026-08-30 15:43:35",
    ipHash: "abc123hash",
    subscribeToUpdates: true,
  });

  assert.match(content.html, /background-color:#F1EEE5/);
  assert.match(content.html, /background-color:#FF4D00/);
  assert.match(content.html, /background-color:#D9FF43/);
  assert.match(content.html, /background-color:#2457FF/);
  assert.match(content.html, /border:2px solid #171713/);
  assert.match(content.html, /box-shadow:8px 8px 0 #FF4D00/);
  assert.match(content.html, /Ref\. CV-01/);
  assert.doesNotMatch(content.html, /linear-gradient|border-radius/i);
});

test("escapes values received from SQS before inserting them into HTML", () => {
  const content = createResumeRequestNotificationEmail({
    requestId: '<script>alert("request")</script>',
    email: '<img src=x onerror="alert(1)">',
    requestedAt: "2026-08-30 <unsafe>",
    ipHash: "hash&value",
    subscribeToUpdates: false,
  });

  assert.doesNotMatch(content.html, /<script>/);
  assert.doesNotMatch(content.html, /<img src=x/);
  assert.match(content.html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(content.html, /hash&amp;value/);
  assert.match(content.html, />No</);
  assert.match(content.html, /Registro existente confirmado/);
});
