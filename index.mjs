import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nodemailer from "nodemailer";

import { DynamoDbResumeRequestClient } from "./src/clients/aws/dynamodb-resume-request-client.mjs";
import { GmailSmtpEmailClient } from "./src/clients/gmail/gmail-smtp-email-client.mjs";
import { loadConfig } from "./src/config/environment.mjs";
import { createResumeRequestHandler } from "./src/handlers/resume-request-handler.mjs";
import { ResumeRequestService } from "./src/services/resume-request-service.mjs";

const config = loadConfig();

const resumeRequestRepository = new DynamoDbResumeRequestClient({
  dynamodb: new DynamoDBClient({}),
  tableName: config.dynamodb.tableName,
});

const smtpTransporter = nodemailer.createTransport({
  host: config.gmailSmtp.host,
  port: config.gmailSmtp.port,
  secure: config.gmailSmtp.secure,
  auth: {
    user: config.gmailSmtp.user,
    pass: config.gmailSmtp.appPassword,
  },
});

const emailClient = new GmailSmtpEmailClient({
  transporter: smtpTransporter,
  ...config.notification,
});

const resumeRequestService = new ResumeRequestService({
  resumeRequestRepository,
  emailClient,
});

export const handler = createResumeRequestHandler({ resumeRequestService });
