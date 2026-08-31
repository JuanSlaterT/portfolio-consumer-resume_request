import {
  createCloudFrontFileUrl,
  createResumeDeliveryEmailLayout,
} from "./resume-delivery-email-layout.mjs";

const FILE_NAME = "CV_JUAN_AREVALO.pdf";

export function createSpanishResumeDeliveryEmail({ cloudfrontUrl }) {
  return createResumeDeliveryEmailLayout({
    language: "es",
    subject: "Tu CV está listo | Juan Arévalo",
    preheader: "Gracias por tu interés. Ya puedes descargar el CV de Juan Arévalo.",
    badge: "CV disponible",
    eyebrow: "Gracias por tu interés",
    headline: "Mi CV está",
    headlineAccent: "listo para ti.",
    description:
      "Aquí encontrarás un resumen de mi experiencia, proyectos y habilidades en desarrollo de software y arquitectura cloud.",
    fileLabel: "Documento en español",
    fileName: FILE_NAME,
    buttonLabel: "Descargar CV",
    helperText:
      "El documento se entrega de forma segura mediante Amazon CloudFront.",
    footerText:
      "Recibiste este correo porque solicitaste mi CV desde el portafolio.",
    downloadUrl: createCloudFrontFileUrl(cloudfrontUrl, FILE_NAME),
  });
}
