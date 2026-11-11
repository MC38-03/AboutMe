import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase/firestore/lite";
import { getDb } from "./client";

interface ViewDocument {
  count: number;
}

const converter: FirestoreDataConverter<ViewDocument> = {
  toFirestore: (view) => ({ count: view.count }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<ViewDocument>) => ({
    count: snapshot.data().count,
  }),
};

export async function countView(slug: string, increase: boolean) {
  const db = await getDb();
  const { doc, getDoc, increment, runTransaction } =
    await import("firebase/firestore/lite");
  const ref = doc(db, "views", slug).withConverter(converter);

  if (!increase) {
    const snapshot = await getDoc(ref);
    return snapshot.data()?.count ?? 0;
  }

  return runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);
    const current = snapshot.data()?.count;
    if (current === undefined) {
      tx.set(ref, { count: 1 });
      return 1;
    }
    tx.update(ref, { count: increment(1) });
    return current + 1;
  });
}
