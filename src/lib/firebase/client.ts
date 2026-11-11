import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore/lite";

const env = import.meta.env;

const config = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: env.PUBLIC_FIREBASE_APP_ID ?? "",
};

const useEmulator = env.PUBLIC_FIREBASE_EMULATOR === "true";

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let firestore: Promise<Firestore> | undefined;

async function setupAppCheck(app: FirebaseApp): Promise<void> {
  const siteKey = env.PUBLIC_RECAPTCHA_SITE_KEY;
  if (useEmulator || !siteKey) return;
  const { initializeAppCheck, ReCaptchaEnterpriseProvider } =
    await import("firebase/app-check");
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

async function init(): Promise<Firestore> {
  const [{ initializeApp }, { getFirestore, connectFirestoreEmulator }] =
    await Promise.all([
      import("firebase/app"),
      import("firebase/firestore/lite"),
    ]);
  const app = initializeApp(config);
  await setupAppCheck(app);
  const db = getFirestore(app);
  if (useEmulator) connectFirestoreEmulator(db, "127.0.0.1", 8080);
  return db;
}

export function getDb(): Promise<Firestore> {
  firestore ??= init();
  return firestore;
}
