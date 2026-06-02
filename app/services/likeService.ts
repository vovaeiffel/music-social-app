import { db } from "@/lib/firebase";

import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

export type LikeType = {
  user_id: string;
  pin_id: string;
  created_at: number;
};

export async function likePin(userId: string, pinId: string) {
  const likeId = `${userId}_${pinId}`;

  await setDoc(doc(db, "likes", likeId), {
    user_id: userId,
    pin_id: pinId,
    created_at: Date.now(),
  });
}

export async function unlikePin(userId: string, pinId: string) {
  const likeId = `${userId}_${pinId}`;

  await deleteDoc(doc(db, "likes", likeId));
}

export async function isPinLiked(userId: string, pinId: string) {
  const likeId = `${userId}_${pinId}`;

  const snap = await getDoc(doc(db, "likes", likeId));

  return snap.exists();
}
