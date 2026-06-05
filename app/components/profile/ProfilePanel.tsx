"use client";

import type { PinType } from "@/app/types/pin";
import type { UserProfileType } from "@/app/types/user";
import { useState, useEffect } from "react";
import {
  getFollowersCount,
  getFollowingCount,
  getFollowingProfiles,
} from "@/app/services/followService";

type Props = {
  user: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  };

  profile: UserProfileType | null;

  pins: PinType[];

  savedPins: PinType[];

  isShowingSaved: boolean;

  setIsShowingSaved: (value: boolean) => void;

  isProfileOpen: boolean;

  setSelectedPin: (pin: PinType) => void;

  onLogout: () => void;

  onOpenSettings: () => void;

  setIsProfileOpen: (value: boolean) => void;

  openProfileOverlay: () => void;

  onOpenUserProfile?: (profile: UserProfileType) => void;
};

export default function ProfilePanel(props: Props) {
  console.log(props);

  const {
    user,
    profile,
    pins,
    savedPins,
    isShowingSaved,
    setIsShowingSaved,
    isProfileOpen,
    setIsProfileOpen,
    setSelectedPin,
    onLogout,
    onOpenSettings,
    onOpenUserProfile,
  } = props;
  const [showAllPins, setShowAllPins] = useState(false);

  const [showFollowingList, setShowFollowingList] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<UserProfileType[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const handleOpenFollowing = async () => {
    if (!user?.id) return;
    setShowFollowingList(true);

    // Загружаем список профилей
    const profiles = await getFollowingProfiles(user.id);
    setFollowingUsers(profiles);
  };

  useEffect(() => {
    async function loadOwnStats() {
      if (!user?.id) return;

      // Получаем количество подписчиков для себя
      const followers = await getFollowersCount(user.id);
      setFollowersCount(followers);

      // Получаем количество подписок (на кого подписан я)
      const following = await getFollowingCount(user.id);
      setFollowingCount(following);
    }

    loadOwnStats();
    // Перезапускаем загрузку, если профиль или количество сохраненных пинов изменилось
    // (ведь клик по кнопке подписки/отписки будет происходить в другой панели,
    // но когда мы вернемся сюда или стейты обновятся, цифры обновятся при фокусе)
  }, [user?.id, profile]);

  console.log("saved state:", {
    isShowingSaved,
    setIsShowingSaved,
  });
  return (
    <div
      className="
        absolute
        top-4
        left-4
        z-[3000]
      "
    >
      <div
        className={`
    w-[280px]
    max-w-[calc(100vw-32px)]

    rounded-3xl

    bg-zinc-900/85
    backdrop-blur-2xl

    border
    border-white/10

    shadow-2xl

    overflow-hidden

    transition-all
    duration-300
  `}
      >
        {/* PROFILE HEADER */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="
      w-full

      p-4

      flex
      items-center
      gap-3

      hover:bg-white/5

      transition-colors
    "
        >
          {profile?.avatar && (
            <img
              src={profile?.avatar}
              alt="avatar"
              className="
          w-11
          h-11
          rounded-full

          border
          border-white/10
        "
            />
          )}

          <div className="flex-1 text-left">
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm flex-1 truncate">
                {profile?.display_name || user.name || user.email}

                {profile?.user_tag && (
                  <span className="text-zinc-500 ml-1">
                    #{profile.user_tag}
                  </span>
                )}
              </p>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings();
                }}
                className="
      text-sm
      text-zinc-400
      hover:text-white
      transition
      cursor-pointer
    "
              >
                ⚙️
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();

                  const confirmed = window.confirm(
                    "Do you really want to logout?",
                  );

                  if (confirmed) {
                    onLogout();
                  }
                }}
                className="
      text-sm
      text-red-400/70
      hover:text-red-300
      transition
      ml-11
      cursor-pointer
    "
              >
                ⛔
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-zinc-400">
                  {profile?.status || "music explorer"}
                </p>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSettings();
                  }}
                  className="
        text-[10px]
        text-zinc-500
        hover:text-white
        transition
        cursor-pointer
      "
                >
                  ✎
                </div>
              </div>

              <p className="text-[11px] text-zinc-500">
                @{profile?.username || "username"}
              </p>
            </div>
          </div>

          <div
            className={`
        text-white/50
        text-xl
        leading-none

        transition-transform
        duration-300

        ${isProfileOpen ? "rotate-90" : ""}
      `}
          >
            ☰
          </div>
        </button>

        {isProfileOpen && (
          <div
            className="
        border-t
        border-white/10

        px-4
        pb-4

        animate-in
        slide-in-from-top-2
        fade-in
        duration-300
      "
          >
            {/* PROFILE CONTENT */}
            {showAllPins ? (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setShowAllPins(false)}
                    className="
        text-xs
        text-zinc-400
        hover:text-white
        transition
      "
                  >
                    ← Back
                  </button>

                  <p className="text-sm font-semibold">All Pins</p>
                </div>

                <div
                  className="
      flex
      flex-col
      gap-2

      max-h-[320px]
      overflow-y-auto

      pr-1
    "
                >
                  {pins
                    .filter((p) => p.user_id === user.id)
                    .map((pin) => (
                      <button
                        key={pin.id}
                        onClick={() => {
                          setSelectedPin(pin);
                          setIsProfileOpen(false);
                        }}
                        className="
            w-full
            rounded-2xl
            bg-white/5
            hover:bg-white/10
            p-3
            text-left
            transition-all
            duration-200
          "
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="
                w-10
                h-10
                rounded-xl
                bg-black/30
                flex
                items-center
                justify-center
                text-lg
              "
                          >
                            {pin.pin_type === "music" && "🎵"}
                            {pin.pin_type === "concert" && "🎤"}
                            {pin.pin_type === "roadtrip" && "🚗"}
                            {pin.pin_type === "camping" && "⛺"}
                            {pin.pin_type === "night" && "🌙"}
                            {pin.pin_type === "summer" && "☀️"}
                            {pin.pin_type === "person" && "👤"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {pin.song_title}
                            </p>

                            <p className="text-xs text-zinc-400 truncate">
                              {pin.artist_name}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ) : showFollowingList ? (
              // --- НАЧАЛО ЭКРАНА СПИСКА ПОДПИСОК ---
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setShowFollowingList(false)}
                    className="text-xs text-zinc-400 hover:text-white transition"
                  >
                    ← Back
                  </button>
                  <p className="text-sm font-semibold">Following</p>
                </div>

                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {followingUsers.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">
                      No subscriptions yet
                    </p>
                  ) : (
                    followingUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          // Вызываем напрямую из props, чтобы точно сработало
                          if (props.onOpenUserProfile) {
                            props.onOpenUserProfile(u);
                          }
                          setIsProfileOpen(false); // закрываем свою левую панель
                        }}
                        className="w-full rounded-2xl bg-white/5 hover:bg-white/10 p-3 text-left transition flex items-center gap-3"
                      >
                        {u.avatar && (
                          <img
                            src={u.avatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-full border border-white/10"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {u.display_name || u.username}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">
                            {u.status || `@${u.username}`}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : // --- КОНЕЦ ЭКРАНА СПИСКА ПОДПИСОК ---
            isShowingSaved ? (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setIsShowingSaved(false)}
                    className="
          text-xs
          text-zinc-400
          hover:text-white
          transition
        "
                  >
                    ← Back
                  </button>

                  <p className="text-sm font-semibold">Saved Pins</p>
                </div>

                <div
                  className="
        flex
        flex-col
        gap-2
        max-h-[320px]
        overflow-y-auto
        pr-1
      "
                >
                  {savedPins.map((pin) => (
                    <button
                      key={pin.id}
                      onClick={() => {
                        setSelectedPin(pin);
                        setIsProfileOpen(false);
                      }}
                      className="
            w-full
            rounded-2xl
            bg-white/5
            hover:bg-white/10
            p-3
            text-left
            transition-all
            duration-200
          "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                w-10
                h-10
                rounded-xl
                bg-black/30
                flex
                items-center
                justify-center
                text-lg
              "
                        >
                          {pin.pin_type === "music" && "🎵"}
                          {pin.pin_type === "concert" && "🎤"}
                          {pin.pin_type === "roadtrip" && "🚗"}
                          {pin.pin_type === "camping" && "⛺"}
                          {pin.pin_type === "night" && "🌙"}
                          {pin.pin_type === "summer" && "☀️"}
                          {pin.pin_type === "person" && "👤"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {pin.song_title}
                          </p>

                          <p className="text-xs text-zinc-400 truncate">
                            {pin.artist_name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-4 space-y-4">
                {/* СЕТКА СТАТИСТИКИ СОБСТВЕННОГО ПРОФИЛЯ */}
                <div className="grid grid-cols-3 gap-2 bg-white/5 rounded-2xl p-2 text-center">
                  <div>
                    <p className="font-bold text-sm">
                      {profile?.pins_count || 0}
                    </p>
                    <p className="text-[10px] text-zinc-400">Pins</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{followersCount}</p>
                    <p className="text-[10px] text-zinc-400">Followers</p>
                  </div>
                  <button
                    className="hover:bg-white/5 rounded-xl transition active:scale-95"
                    onClick={handleOpenFollowing} // <-- Теперь кнопка запускает загрузку и открывает экран
                  >
                    <p className="font-bold text-sm">{followingCount}</p>
                    <p className="text-[10px] text-zinc-400">Following</p>
                  </button>
                </div>

                {/* RECENT PINS */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-white/90">
                      My Pins
                    </p>

                    <button
                      onClick={() => setShowAllPins(true)}
                      className="
    text-xs
    text-zinc-400
    hover:text-white
    transition
  "
                    >
                      View all
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {pins
                      .filter((p) => p.user_id === user.id)
                      .slice(0, 3)
                      .map((pin) => (
                        <button
                          key={pin.id}
                          onClick={() => {
                            setSelectedPin(pin);

                            setIsProfileOpen(false);
                          }}
                          className="
            w-full

            rounded-2xl

            bg-white/5
            hover:bg-white/10

            p-3

            text-left

            transition-all
            duration-200
          "
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="
                w-10
                h-10

                rounded-xl

                bg-black/30

                flex
                items-center
                justify-center

                text-lg
              "
                            >
                              {pin.pin_type === "music" && "🎵"}
                              {pin.pin_type === "concert" && "🎤"}
                              {pin.pin_type === "roadtrip" && "🚗"}
                              {pin.pin_type === "camping" && "⛺"}
                              {pin.pin_type === "night" && "🌙"}
                              {pin.pin_type === "summer" && "☀️"}
                              {pin.pin_type === "person" && "👤"}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {pin.song_title}
                              </p>

                              <p className="text-xs text-zinc-400 truncate">
                                {pin.artist_name}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                <div
                  className="
    flex-1
    rounded-2xl
    bg-white/5
    p-3
  "
                >
                  <button
                    onClick={() => setIsShowingSaved(true)}
                    className="
    w-full
    text-left
  "
                  >
                    <p className="text-lg font-bold">
                      {savedPins?.length || 0}
                    </p>

                    <p className="text-xs text-zinc-400">Saved</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
