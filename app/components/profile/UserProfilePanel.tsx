"use client";

import type { UserProfileType } from "@/app/types/user";

import { useEffect, useState } from "react";

import {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowersCount,
  getFollowingCount,
} from "@/app/services/followService";

type Props = {
  profile: UserProfileType | null;

  currentUserId: string;

  onClose: () => void;
  onVisitMap: () => void;
};

export default function UserProfilePanel({
  profile,
  currentUserId,
  onClose,
  onVisitMap,
}: Props) {
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    async function loadFollowState() {
      if (!profile) return;

      // 1. Проверяем статус подписки (только если есть текущий пользователь)
      if (currentUserId) {
        const result = await isFollowing(currentUserId, profile.id);
        setFollowing(result);
      }

      // 2. Получаем количество подписчиков этого профиля
      const followers = await getFollowersCount(profile.id);
      setFollowersCount(followers);

      // 3. Получаем количество подписок этого профиля
      const followingNum = await getFollowingCount(profile.id);
      setFollowingCount(followingNum);
    }

    loadFollowState();
  }, [profile, currentUserId]);

  console.log({
    currentUserId,
    profileId: profile?.id,
  });
  return (
    <div
      className="
        absolute
        top-4
        left-[320px]
        z-[3000]
      "
    >
      <div
        className="
          w-[280px]
          rounded-3xl
          bg-zinc-900/85
          backdrop-blur-2xl
          border
          border-white/10
          p-4
          text-white
        "
      >
        <div className="flex justify-between items-center mb-4">
          <p className="font-semibold">User Profile</p>

          <button onClick={onClose} className="text-white/50 hover:text-white">
            ×
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          {profile?.avatar && (
            <img
              src={profile.avatar}
              alt="avatar"
              className="
        w-20
        h-20
        rounded-full
        border
        border-white/10
        mb-3
      "
            />
          )}

          <p className="text-lg font-semibold">
            {profile?.display_name || "Unknown User"}
          </p>

          <p className="text-sm text-zinc-500">
            @{profile?.username || "username"}
          </p>

          <p className="text-xs text-zinc-400 mt-2">
            {profile?.status || "music explorer"}
          </p>
        </div>

        <div
          className="
    grid
    grid-cols-3
    gap-2
    mt-5
  "
        >
          <div
            className="
      rounded-2xl
      bg-white/5
      p-3
      text-center
    "
          >
            {/* Выводим реальное количество пинов из профиля */}
            <p className="font-bold">{profile?.pins_count || 0}</p>
            <p className="text-[11px] text-zinc-400">Pins</p>
          </div>

          <div
            className="
      rounded-2xl
      bg-white/5
      p-3
      text-center
    "
          >
            {/* Выводим количество подписчиков из нашего стейта */}
            <p className="font-bold">{followersCount}</p>
            <p className="text-[11px] text-zinc-400">Followers</p>
          </div>

          <div
            className="
      rounded-2xl
      bg-white/5
      p-3
      text-center
    "
          >
            {/* Выводим количество подписок из нашего стейта */}
            <p className="font-bold">{followingCount}</p>
            <p className="text-[11px] text-zinc-400">Following</p>
          </div>
        </div>

        <button
          disabled={!currentUserId || currentUserId === profile?.id}
          onClick={async () => {
            if (!profile || !currentUserId) return;

            if (following) {
              await unfollowUser(currentUserId, profile.id);
              setFollowing(false);
              // УМЕНЬШАЕМ количество подписчиков на 1 в интерфейсе
              setFollowersCount((prev) => Math.max(0, prev - 1));
            } else {
              await followUser(currentUserId, profile.id);
              setFollowing(true);
              // УВЕЛИЧИВАЕМ количество подписчиков на 1 в интерфейсе
              setFollowersCount((prev) => prev + 1);
            }
          }}
          className="
    w-full
    mt-5

    rounded-2xl

    bg-white
    text-black

    py-3

    font-semibold

    hover:opacity-90
    disabled:opacity-50
    transition
  "
        >
          {following ? "Unfollow" : "Follow"}
        </button>

        {/* КНОПКА ПУТЕШЕСТВИЯ НА КАРТУ ПОЛЬЗОВАТЕЛЯ */}
        <button
          onClick={onVisitMap}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-2xl transition shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
        >
          <span>🗺️</span>
          {`Explore ${profile?.display_name || profile?.username || "User"}'s Map`}
        </button>
      </div>
    </div>
  );
}
