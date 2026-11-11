import type { FieldValue } from "firebase/firestore/lite";
import type { Locale } from "@/i18n/locales";
import type { ContactMessage } from "@/lib/contact";
import { getDb } from "./client";

export interface MessageInput extends ContactMessage {
  lang: Locale;
}

interface MessageDocument extends MessageInput {
  createdAt: FieldValue;
}

export async function sendMessage(input: MessageInput): Promise<void> {
  const db = await getDb();
  const { addDoc, collection, serverTimestamp } =
    await import("firebase/firestore/lite");
  const message: MessageDocument = {
    name: input.name,
    email: input.email,
    message: input.message,
    lang: input.lang,
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, "messages"), message);
}
