import { db } from "@/lib/firebase";

import { collection, getDocs, query, where } from "firebase/firestore";

export async function getSavedPinIds(userId: string): Promise<string[]> {
  const q = query(collection(db, "likes"), where("user_id", "==", userId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data().pin_id);
}
