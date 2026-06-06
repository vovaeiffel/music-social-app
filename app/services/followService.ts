import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  getCountFromServer,
  doc,
  getDoc,
} from "firebase/firestore";

import type { UserProfileType } from "../types/user";
import { db } from "@/lib/firebase";

// Вспомогательная функция задержки
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function followUser(followerId: string, followingId: string) {
  if (!followerId || !followingId) return;

  await addDoc(collection(db, "follows"), {
    follower_id: followerId,
    following_id: followingId,
    created_at: Date.now(),
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
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
  if (!followerId || !followingId) return false;

  const q = query(
    collection(db, "follows"),
    where("follower_id", "==", followerId),
    where("following_id", "==", followingId),
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}

export async function getFollowersCount(userId: string): Promise<number> {
  if (!userId) return 0;

  const q = query(
    collection(db, "follows"),
    where("following_id", "==", userId),
  );

  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getFollowingCount(userId: string): Promise<number> {
  if (!userId) return 0;

  const q = query(
    collection(db, "follows"),
    where("follower_id", "==", userId),
  );

  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function getFollowingProfiles(
  userId: string,
): Promise<UserProfileType[]> {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, "follows"),
      where("follower_id", "==", userId),
    );
    const snapshot = await getDocs(q);

    const followingIds = snapshot.docs.map((doc) => doc.data().following_id);

    if (followingIds.length === 0) return [];

    const profilesPromises = followingIds.map(async (id, index) => {
      // Задержка, чтобы не перегружать сеть
      await delay(index * 100);

      if (id === "fake_user_id_123") {
        return {
          id: "fake_user_id_123",
          username: "daft_punk_fan",
          display_name: "Thomas Bangalter",
          bio: "Electronic music lover",
          status: "Listening to Homework 🎧",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Thomas",
          pins_count: 12,
          created_at: Date.now(),
          likes_received: 42,
        } as UserProfileType;
      }

      const userDoc = await getDoc(doc(db, "users", id));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserProfileType;
      }
      return null;
    });

    const profiles = await Promise.all(profilesPromises);
    return profiles.filter((p): p is UserProfileType => p !== null);
  } catch (error) {
    console.error("Error fetching following profiles:", error);
    return [];
  }
}
