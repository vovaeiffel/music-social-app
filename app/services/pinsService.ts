import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PinType } from "@/app/types/pin";

// pinsService.ts
export function subscribeToPins(callback: (pins: PinType[]) => void) {
  // Убедись, что здесь ПРОСТО запрос к коллекции
  const q = query(collection(db, "pins"));

  return onSnapshot(q, (snapshot) => {
    const pins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<PinType, "id">),
    }));
    // Вызываем колбэк только тогда, когда данные РЕАЛЬНО пришли
    callback(pins);
  });
}
