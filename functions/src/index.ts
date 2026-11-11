import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

const resendApiKey = defineSecret("RESEND_API_KEY");
const notifyEmail = defineSecret("NOTIFY_EMAIL");

interface Message {
  name: string;
  email: string;
  message: string;
  lang: string;
}

function isMessage(data: unknown): data is Message {
  if (typeof data !== "object" || data === null) return false;
  const record = data as Record<string, unknown>;
  return ["name", "email", "message", "lang"].every(
    (key) => typeof record[key] === "string",
  );
}

export const notifyOnMessage = onDocumentCreated(
  {
    document: "messages/{messageId}",
    region: "europe-west4",
    secrets: [resendApiKey, notifyEmail],
    maxInstances: 2,
    memory: "256MiB",
    retry: false,
  },
  async (event) => {
    const data: unknown = event.data?.data();
    if (!isMessage(data)) {
      logger.warn("Skipped message with unexpected shape", {
        id: event.params.messageId,
      });
      return;
    }

    const subject = `Portfolio: bericht van ${data.name}`.replace(
      /[\r\n]+/g,
      " ",
    );
    const text = [
      `Naam: ${data.name}`,
      `E-mail: ${data.email}`,
      `Taal: ${data.lang}`,
      "",
      data.message,
      "",
      "Beantwoord deze mail om direct te reageren.",
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey.value()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: [notifyEmail.value()],
        reply_to: data.email,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      logger.error("Resend rejected the notification", {
        id: event.params.messageId,
        status: response.status,
        body: await response.text(),
      });
      return;
    }
    logger.info("Notification sent", { id: event.params.messageId });
  },
);
