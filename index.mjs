import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamodb = new DynamoDBClient({});
const tableName = process.env.DYNAMODB_TABLE_NAME;
const resendApiKey = process.env.RESEND_API_KEY;
const notificationRecipient = "arevalobernaljuan@gmail.com";

if (!tableName) {
  throw new Error("DYNAMODB_TABLE_NAME is required");
}

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is required");
}

function parseResumeRequest(body) {
  let payload;

  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error("message body must be valid JSON");
  }

  if (payload === null || Array.isArray(payload) || typeof payload !== "object") {
    throw new Error("message body must be a JSON object");
  }

  return {
    requestId: payload.requestId,
    email: payload.email,
    requestedAt: payload.requestedAt,
    ipHash: payload.ipHash,
    subscribeToUpdates: payload.subscribeToUpdates,
  };
}

async function storeResumeRequest(resumeRequest) {
  // The queue timestamp belongs to the producer contract. DynamoDB records when
  // this Lambda persisted the item, so it must not reuse the incoming value.
  const persistedAt = new Date().toISOString();

  await dynamodb.send(
    new PutItemCommand({
      TableName: tableName,
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
}

async function sendStoredNotification(resumeRequest) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `resume-request/${resumeRequest.requestId}`,
      "User-Agent": "portfolio-resume-requests-consumer/1.0",
    },
    body: JSON.stringify({
      from: "resend+arevalobernaljuan@gmail.com",
      to: [notificationRecipient],
      subject: "Alguien descargó tu CV.",
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    }),
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    const details = responseBody?.message ?? "Unknown Resend API error";
    throw new Error(`Resend API request failed (${response.status}): ${details}`);
  }

  return responseBody?.id;
}

export async function handler(event) {
  const batchItemFailures = [];

  for (const record of event.Records ?? []) {
    try {
      const resumeRequest = parseResumeRequest(record.body);

      try {
        await storeResumeRequest(resumeRequest);

        console.info("Resume request stored", {
          messageId: record.messageId,
          requestId: resumeRequest.requestId,
        });
      } catch (error) {
        if (error?.name === "ConditionalCheckFailedException") {
          console.info("Resume request already stored", {
            messageId: record.messageId,
            requestId: resumeRequest.requestId,
          });
        } else {
          throw error;
        }
      }

      const emailId = await sendStoredNotification(resumeRequest);

      console.info("Notification email sent", {
        messageId: record.messageId,
        requestId: resumeRequest.requestId,
        emailId,
      });
    } catch (error) {
      console.error("Resume request processing failed", {
        messageId: record.messageId,
        errorName: error?.name ?? "Error",
        errorMessage: error?.message ?? "Unknown error",
      });

      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
}
