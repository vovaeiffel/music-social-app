"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { updateUserProfile } from "@/app/services/userService";

import type { UserProfileType } from "@/app/types/user";

import type { PinType } from "@/app/types/pin";

type Props = {
  user: {
    id: string;
    name?: string;
    avatar?: string;
  };

  pins: PinType[];

  profile: UserProfileType | null;

  myPinsCount: number;

  setProfile: (profile: UserProfileType) => void;

  onClose: () => void;
};

export default function ProfileOverlay({
  user,
  profile,
  myPinsCount,
  setProfile,
  onClose,
}: Props) {
  const [username, setUsername] = useState("");

  const [displayName, setDisplayName] = useState(user.name || "");

  const [bio, setBio] = useState("");

  const [status, setStatus] = useState("");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const saveProfile = async () => {
    if (!username.trim()) {
      alert("Username required");

      return;
    }

    try {
      await updateUserProfile({
        id: user.id,

        username,

        display_name: displayName,

        bio,

        status,
      });

      if (!profile) return;

      setProfile({
        ...profile,
        username,
        display_name: displayName,
        bio,
        status,
      });

      onClose();
    } catch (error) {
      console.error(error);

      alert("Error updating profile");
    }
  };

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-[10000]
        flex
        items-center
        justify-center
        bg-black/60
        backdrop-blur-sm
      "
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{
          opacity: 0,
          scale: 0.9,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        className="
          w-[380px]
          max-w-[92vw]

          rounded-3xl

          bg-zinc-900

          border
          border-white/10

          p-5

          text-white
        "
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">Edit profile</h2>

          {/* Счётчик, который будет брать данные из page.tsx */}
          <div className="text-xs text-zinc-500">
            Pins: <span className="text-white font-bold">{myPinsCount}</span>
          </div>

          <button onClick={onClose} className="text-white/50 hover:text-white">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="
              w-full
              rounded-xl
              bg-white/5
              border
              border-white/10
              px-3
              py-2
              outline-none
            "
          />

          <input
            type="text"
            placeholder="display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="
              w-full
              rounded-xl
              bg-white/5
              border
              border-white/10
              px-3
              py-2
              outline-none
            "
          />

          <input
            type="text"
            placeholder="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="
    w-full
    rounded-xl
    bg-white/5
    border
    border-white/10
    px-3
    py-2
    outline-none
  "
          />

          <textarea
            placeholder="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="
              w-full
              h-24
              resize-none
              rounded-xl
              bg-white/5
              border
              border-white/10
              px-3
              py-2
              outline-none
            "
          />

          <button
            onClick={saveProfile}
            className="
              w-full
              rounded-xl
              bg-white
              text-black
              py-2
              font-medium
            "
          >
            Save profile
          </button>
        </div>
      </motion.div>
    </div>
  );
}
