const EMAIL_SENDER = "arevalobernaljuan@gmail.com";
const EMAIL_RECIPIENT = "arevalobernaljuan@gmail.com";
const EMAIL_SUBJECT = "Alguien descargó tu CV.";

function readRequiredValue(environment, name) {
  const value = environment[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function loadConfig(environment = process.env) {
  return Object.freeze({
    dynamodb: Object.freeze({
      tableName: readRequiredValue(environment, "DYNAMODB_TABLE_NAME"),
    }),
    mailjet: Object.freeze({
      apiKey: readRequiredValue(environment, "MAILJET_API_KEY"),
      apiSecret: readRequiredValue(environment, "MAILJET_SECRET_KEY"),
      apiUrl: readRequiredValue(environment, "MAILJET_API_URL"),
      from: EMAIL_SENDER,
      recipient: EMAIL_RECIPIENT,
      subject: EMAIL_SUBJECT,
      userAgent: "portfolio-resume-requests-consumer/1.0",
    }),
  });
}
