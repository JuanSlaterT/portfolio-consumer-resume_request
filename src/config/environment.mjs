const GMAIL_SMTP_HOST = "smtp.gmail.com";
const GMAIL_SMTP_PORT = 465;
const GMAIL_SMTP_USER = "arevalobernaljuan@gmail.com";
const EMAIL_SENDER = GMAIL_SMTP_USER;
const EMAIL_ADMIN_RECIPIENT = "arevalobernaljuan+portfolio@gmail.com";
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
    gmailSmtp: Object.freeze({
      host: GMAIL_SMTP_HOST,
      port: GMAIL_SMTP_PORT,
      secure: true,
      user: GMAIL_SMTP_USER,
      appPassword: readRequiredValue(environment, "GMAIL_SMTP_APP_PASSWORD"),
    }),
    notification: Object.freeze({
      from: EMAIL_SENDER,
      recipient: EMAIL_ADMIN_RECIPIENT,
      subject: EMAIL_SUBJECT,
    }),
  });
}
