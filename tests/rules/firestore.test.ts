import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const validMessage = () => ({
  name: "Test Recruiter",
  email: "recruiter@example.com",
  message: "Hoi Muhammed, we hebben een stageplek voor je.",
  lang: "nl",
  createdAt: serverTimestamp(),
});

function db() {
  return env.unauthenticatedContext().firestore();
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-portfolio",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
});

describe("messages", () => {
  it("allows a valid message", async () => {
    await assertSucceeds(addDoc(collection(db(), "messages"), validMessage()));
  });

  it("rejects reading, updating and deleting", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "messages/existing"), {
        ...validMessage(),
      });
    });
    await assertFails(getDoc(doc(db(), "messages/existing")));
    await assertFails(getDocs(collection(db(), "messages")));
    await assertFails(
      updateDoc(doc(db(), "messages/existing"), { name: "Changed" }),
    );
    await assertFails(deleteDoc(doc(db(), "messages/existing")));
  });

  it("rejects extra or missing fields", async () => {
    await assertFails(
      addDoc(collection(db(), "messages"), { ...validMessage(), admin: true }),
    );
    const withoutLang: Record<string, unknown> = validMessage();
    delete withoutLang.lang;
    await assertFails(addDoc(collection(db(), "messages"), withoutLang));
  });

  it("rejects invalid lengths and types", async () => {
    const add = (patch: Record<string, unknown>) =>
      addDoc(collection(db(), "messages"), { ...validMessage(), ...patch });
    await assertFails(add({ name: "" }));
    await assertFails(add({ name: "a".repeat(101) }));
    await assertFails(add({ message: "too short" }));
    await assertFails(add({ message: "a".repeat(2001) }));
    await assertFails(add({ email: "not-an-email" }));
    await assertFails(add({ name: 42 }));
    await assertFails(add({ lang: "de" }));
  });

  it("rejects a client-chosen timestamp", async () => {
    await assertFails(
      addDoc(collection(db(), "messages"), {
        ...validMessage(),
        createdAt: new Date("2020-01-01"),
      }),
    );
  });
});

describe("views", () => {
  it("allows creating a counter at 1 and incrementing by 1", async () => {
    const ref = doc(db(), "views/gymtracker");
    await assertSucceeds(setDoc(ref, { count: 1 }));
    await assertSucceeds(updateDoc(ref, { count: increment(1) }));
    await assertSucceeds(getDoc(ref));
  });

  it("rejects other increments and fields", async () => {
    const ref = doc(db(), "views/gymtracker");
    await assertFails(setDoc(ref, { count: 100 }));
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "views/gymtracker"), { count: 5 });
    });
    await assertFails(updateDoc(ref, { count: increment(5) }));
    await assertFails(updateDoc(ref, { count: 0 }));
    await assertFails(updateDoc(ref, { count: increment(1), hacked: true }));
    await assertFails(deleteDoc(ref));
  });

  it("rejects listing and invalid ids", async () => {
    await assertFails(getDocs(collection(db(), "views")));
    await assertFails(setDoc(doc(db(), "views/NOT_VALID"), { count: 1 }));
  });
});

describe("everything else", () => {
  it("is denied", async () => {
    await assertFails(setDoc(doc(db(), "users/someone"), { a: 1 }));
    await assertFails(getDoc(doc(db(), "users/someone")));
  });
});
