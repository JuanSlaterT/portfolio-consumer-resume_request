import assert from "node:assert/strict";
import test from "node:test";

import { createEnglishResumeDeliveryEmail } from "../../src/templates/resume-delivery/resume-delivery-email-en.mjs";
import { createSpanishResumeDeliveryEmail } from "../../src/templates/resume-delivery/resume-delivery-email-es.mjs";

const cloudfrontUrl = "https://d2mn50bb67ywc9.cloudfront.net";

test("renders the Spanish CV delivery template", () => {
  const content = createSpanishResumeDeliveryEmail({ cloudfrontUrl });

  assert.equal(content.subject, "Tu CV está listo | Juan Arévalo");
  assert.equal(
    content.downloadUrl,
    `${cloudfrontUrl}/CV_JUAN_AREVALO.pdf`,
  );
  assert.match(content.html, /lang="es"/);
  assert.match(content.html, />Descargar CV/);
  assert.match(content.text, /Documento en español: CV_JUAN_AREVALO\.pdf/);
});

test("renders the English resume delivery template", () => {
  const content = createEnglishResumeDeliveryEmail({ cloudfrontUrl });

  assert.equal(content.subject, "Your resume is ready | Juan Arévalo");
  assert.equal(
    content.downloadUrl,
    `${cloudfrontUrl}/RESUME_JUAN_AREVALO.pdf`,
  );
  assert.match(content.html, /lang="en"/);
  assert.match(content.html, />Download Resume/);
  assert.match(content.text, /English document: RESUME_JUAN_AREVALO\.pdf/);
});

test("uses the brutalist editorial visual system in every delivery language", () => {
  const templates = [
    createSpanishResumeDeliveryEmail({ cloudfrontUrl }),
    createEnglishResumeDeliveryEmail({ cloudfrontUrl }),
  ];

  for (const content of templates) {
    assert.match(content.html, /background-color:#F1EEE5/);
    assert.match(content.html, /background-color:#FF4D00/);
    assert.match(content.html, /background-color:#D9FF43/);
    assert.match(content.html, /background-color:#2457FF/);
    assert.match(content.html, /border:2px solid #171713/);
    assert.match(content.html, /box-shadow:4px 4px 0 #FF4D00/);
    assert.match(content.html, /Ref\. CV-02/);
    assert.doesNotMatch(content.html, /linear-gradient|border-radius/i);
  }
});

test("requires HTTPS for the CloudFront download URL", () => {
  assert.throws(
    () =>
      createSpanishResumeDeliveryEmail({
        cloudfrontUrl: "http://assets.example.com",
      }),
    /CLOUDFRONT_URL must use HTTPS/,
  );
});
