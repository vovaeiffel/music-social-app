import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// Вспомогательная функция задержки
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getSavedPinIds(userId: string): Promise<string[]> {
  // Добавляем паузу, чтобы этот запрос не "сталкивался" с остальными
  await delay(500);

  const q = query(collection(db, "likes"), where("user_id", "==", userId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data().pin_id);
}
