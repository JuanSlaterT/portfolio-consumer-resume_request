import {
  createCloudFrontFileUrl,
  createResumeDeliveryEmailLayout,
} from "./resume-delivery-email-layout.mjs";

const FILE_NAME = "RESUME_JUAN_AREVALO.pdf";

export function createEnglishResumeDeliveryEmail({ cloudfrontUrl }) {
  return createResumeDeliveryEmailLayout({
    language: "en",
    subject: "Your resume is ready | Juan Arévalo",
    preheader: "Thank you for your interest. Juan Arévalo's resume is ready to download.",
    badge: "Resume available",
    eyebrow: "Thank you for your interest",
    headline: "My resume is",
    headlineAccent: "ready for you.",
    description:
      "Inside you will find an overview of my experience, projects, and skills in software development and cloud architecture.",
    fileLabel: "English document",
    fileName: FILE_NAME,
    buttonLabel: "Download Resume",
    helperText: "The document is delivered securely through Amazon CloudFront.",
    footerText:
      "You received this email because you requested my resume from the portfolio.",
    downloadUrl: createCloudFrontFileUrl(cloudfrontUrl, FILE_NAME),
  });
}
