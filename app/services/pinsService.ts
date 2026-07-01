// 1. ИМПОРТЫ (всегда сверху)
import {
  collection,
  onSnapshot,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PinType } from "@/app/types/pin";

// 2. subscribeToPins
export function subscribeToPins(callback: (pins: PinType[]) => void) {
  const q = query(collection(db, "pins"));

  return onSnapshot(q, (snapshot) => {
    const pins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<PinType, "id">),
    }));

    callback(pins);
  });
}
