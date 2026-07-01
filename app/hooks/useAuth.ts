"use client";

import { useState, useEffect } from "react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

import {
  createUserIfNotExists,
  getUserProfile,
} from "@/app/services/userService";

import type { UserProfileType } from "@/app/types/user";

type UserType = {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
};

export function useAuth() {
  const [user, setUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await createUserIfNotExists({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          avatar: firebaseUser.photoURL || "",
        });

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          avatar: firebaseUser.photoURL || "",
        });

        const profileData = await getUserProfile(firebaseUser.uid);
        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    user,
    profile,
    setProfile,
    loading,
    signInWithGoogle,
  };
}
