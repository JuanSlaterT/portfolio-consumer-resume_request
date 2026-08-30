import { PutItemCommand } from "@aws-sdk/client-dynamodb";

import { DuplicateResumeRequestError } from "./exceptions/duplicate-resume-request-error.mjs";

export class DynamoDbResumeRequestClient {
  constructor({ dynamodb, tableName, clock = () => new Date() }) {
    this.dynamodb = dynamodb;
    this.tableName = tableName;
    this.clock = clock;
  }

  async store(resumeRequest) {
    const persistedAt = this.clock().toISOString();

    try {
      await this.dynamodb.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: {
            requestId: { S: resumeRequest.requestId },
            email: { S: resumeRequest.email },
            requestedAt: { S: resumeRequest.requestedAt },
            ipHash: { S: resumeRequest.ipHash },
            subscribeToUpdates: { BOOL: resumeRequest.subscribeToUpdates },
            timestamp: { S: persistedAt },
          },
          ConditionExpression: "attribute_not_exists(requestId)",
        }),
      );
    } catch (error) {
      if (error?.name === "ConditionalCheckFailedException") {
        throw new DuplicateResumeRequestError(resumeRequest.requestId, {
          cause: error,
        });
      }

      throw error;
    }

    return persistedAt;
  }
}
