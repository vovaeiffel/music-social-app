import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PinType } from "@/app/types/pin";

// Вспомогательная функция задержки
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function loadPins(): Promise<PinType[]> {
  // Добавляем задержку, чтобы инициализация всех сервисов при старте
  // не "завалила" сеть телефона одновременными запросами
  await delay(400);

  const querySnapshot = await getDocs(collection(db, "pins"));

  // Используем .map вместо .forEach — это более современный и безопасный
  // способ трансформации данных в JS
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<PinType, "id">),
  }));
}
