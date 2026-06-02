import { db } from "@/lib/firebase";

import { doc, getDoc, setDoc } from "firebase/firestore";

import type { UserProfileType } from "@/app/types/user";

type CreateUserParams = {
  id: string;

  email?: string;

  name?: string;

  avatar?: string;
};

function generateUsername(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_]/g, "");
}

export async function createUserIfNotExists({
  id,
  name,
  avatar,
}: CreateUserParams) {
  const userRef = doc(db, "users", id);

  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfileType;
  }

  const username = generateUsername(name || "user");

  const userTag = id.slice(-5).toUpperCase();

  const newUser: UserProfileType = {
    id,

    username,

    user_tag: userTag,

    display_name: name || "",

    bio: "",

    status: "music explorer",

    avatar: avatar || "",

    created_at: Date.now(),

    pins_count: 0,

    likes_received: 0,
  };

  await setDoc(userRef, newUser);

  return newUser;
}

import { updateDoc } from "firebase/firestore";

type UpdateUserProfileParams = {
  id: string;

  username: string;

  display_name: string;

  bio: string;

  status: string;
};

export async function updateUserProfile({
  id,
  username,
  display_name,
  bio,
  status,
}: UpdateUserProfileParams) {
  const userRef = doc(db, "users", id);

  await updateDoc(userRef, {
    username: username.toLowerCase(),

    display_name,

    bio,

    status,
  });
}

// ================= PROFILE =================

export async function getUserProfile(id: string) {
  const userRef = doc(db, "users", id);

  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();

  if (!data.user_tag) {
    const userTag = id.slice(-5).toUpperCase();

    await updateDoc(userRef, {
      user_tag: userTag,
    });

    data.user_tag = userTag;
  }

  return data;
}
