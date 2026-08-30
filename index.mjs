import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDbResumeRequestClient } from "./src/clients/aws/dynamodb-resume-request-client.mjs";
import { ResendEmailClient } from "./src/clients/resend/resend-email-client.mjs";
import { loadConfig } from "./src/config/environment.mjs";
import { createResumeRequestHandler } from "./src/handlers/resume-request-handler.mjs";
import { ResumeRequestService } from "./src/services/resume-request-service.mjs";

const config = loadConfig();

const resumeRequestRepository = new DynamoDbResumeRequestClient({
  dynamodb: new DynamoDBClient({}),
  tableName: config.dynamodb.tableName,
});

const emailClient = new ResendEmailClient(config.resend);

const resumeRequestService = new ResumeRequestService({
  resumeRequestRepository,
  emailClient,
});

export const handler = createResumeRequestHandler({ resumeRequestService });
