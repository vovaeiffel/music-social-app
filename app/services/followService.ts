import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  getCountFromServer,
} from "firebase/firestore";

import type { UserProfileType } from "../types/user";

import { db } from "@/lib/firebase";

export async function followUser(followerId: string, followingId: string) {
  // ЕСЛИ ХОТЯ БЫ ОДИН ID ОТСУТСТВУЕТ, НИЧЕГО НЕ ДЕЛАЕМ И ПРЕРЫВАЕМ ФУНКЦИЮ
  if (!followerId || !followingId) return;

  await addDoc(collection(db, "follows"), {
    follower_id: followerId,
    following_id: followingId,
    created_at: Date.now(),
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  // ЕСЛИ ХОТЯ БЫ ОДИН ID ОТСУТСТВУЕТ, НИЧЕГО НЕ ДЕЛАЕМ
  if (!followerId || !followingId) return;

  const q = query(
    collection(db, "follows"),
    where("follower_id", "==", followerId),
    where("following_id", "==", followingId),
  );

  const snapshot = await getDocs(q);

  for (const docRef of snapshot.docs) {
    await deleteDoc(docRef.ref);
  }
}

export async function isFollowing(followerId: string, followingId: string) {
  // ЕСЛИ ХОТЯ БЫ ОДИН ID ОТСУТСТВУЕТ, СРАЗУ ВОЗВРАЩАЕМ FALSE
  if (!followerId || !followingId) return false;

  const q = query(
    collection(db, "follows"),
    where("follower_id", "==", followerId),
    where("following_id", "==", followingId),
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}

// Функция, которая считает, сколько человек подписано на пользователя (его подписчики)
export async function getFollowersCount(userId: string): Promise<number> {
  if (!userId) return 0;

  const q = query(
    collection(db, "follows"),
    where("following_id", "==", userId),
  );

  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

// Функция, которая считает, на скольких человек подписан сам пользователь
export async function getFollowingCount(userId: string): Promise<number> {
  if (!userId) return 0;

  const q = query(
    collection(db, "follows"),
    where("follower_id", "==", userId),
  );

  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

import { doc, getDoc } from "firebase/firestore"; // Убедись, что getDoc импортирован вверху, или Firestore рухнет. Если getDoc уже есть в импортах, эту строку дублировать не нужно.

// Функция, которая находит всех пользователей, на которых подписан userId,
// и возвращает массив с их профилями
export async function getFollowingProfiles(
  userId: string,
): Promise<UserProfileType[]> {
  if (!userId) return [];

  try {
    // 1. Ищем все документы в коллекции follows, где follower_id равен нашему ID
    const q = query(
      collection(db, "follows"),
      where("follower_id", "==", userId),
    );
    const snapshot = await getDocs(q);

    // Получаем массив ID тех, на кого мы подписаны
    const followingIds = snapshot.docs.map((doc) => doc.data().following_id);

    if (followingIds.length === 0) return [];

    // 2. Для каждого ID запрашиваем его профиль из коллекции users
    const profilesPromises = followingIds.map(async (id) => {
      // Исключение для нашего фейк-юзера с добавлением всех обязательных полей типа
      if (id === "fake_user_id_123") {
        return {
          id: "fake_user_id_123",
          username: "daft_punk_fan",
          display_name: "Thomas Bangalter",
          bio: "Electronic music lover",
          status: "Listening to Homework 🎧",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Thomas",
          pins_count: 12,
          created_at: Date.now(), // Добавили обязательное поле
          likes_received: 42, // Добавили обязательное поле
        } as UserProfileType; // Явно говорим TypeScript, что это UserProfileType
      }

      // Для реальных юзеров делаем запрос в Firestore
      const userDoc = await getDoc(doc(db, "users", id));
      if (userDoc.exists()) {
        // Собираем объект и принудительно приводим к типу, чтобы TS не ругался на данные из БД
        return { id: userDoc.id, ...userDoc.data() } as UserProfileType;
      }
      return null;
    });

    const profiles = await Promise.all(profilesPromises);

    // Отфильтровываем пустые профили и возвращаем чистый массив нужного типа
    return profiles.filter((p): p is UserProfileType => p !== null);
  } catch (error) {
    console.error("Error fetching following profiles:", error);
    return [];
  }
}
