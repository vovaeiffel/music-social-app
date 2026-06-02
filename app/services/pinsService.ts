import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

import type { PinType } from "@/app/types/pin";

export async function loadPins(): Promise<PinType[]> {
  const querySnapshot = await getDocs(collection(db, "pins"));

  const loadedPins: PinType[] = [];

  querySnapshot.forEach((document) => {
    loadedPins.push({
      id: document.id,
      ...(document.data() as Omit<PinType, "id">),
    });
  });

  return loadedPins;
}
