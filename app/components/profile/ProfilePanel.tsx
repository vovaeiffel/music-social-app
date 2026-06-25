"use client";

import type { PinType } from "@/app/types/pin";
import type { UserProfileType } from "@/app/types/user";
import { useState, useEffect } from "react";
import {
  getFollowersCount,
  getFollowingCount,
  getFollowingProfiles,
} from "@/app/services/followService";
import {
  Settings,
  LogOut,
  Pencil,
  Menu,
  ArrowLeft,
  Music,
  Mic,
  Car,
  Tent,
  Moon,
  Sun,
  User,
} from "lucide-react";

// Словарь для сопоставления типов пинов и иконок
const PIN_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; strokeWidth?: number }>
> = {
  music: Music,
  concert: Mic,
  roadtrip: Car,
  camping: Tent,
  night: Moon,
  summer: Sun,
  person: User,
};

function PinIcon({ type }: { type: PinType["pin_type"] }) {
  // Безопасный доступ: если type не определен или такого ключа нет, вернется Music по умолчанию
  const IconComponent = (type && PIN_ICONS[type]) || Music;
  return <IconComponent size={20} />;
}

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

    const profiles = await getFollowingProfiles(user.id);
    setFollowingUsers(profiles);
  };

  useEffect(() => {
    async function loadOwnStats() {
      if (!user?.id) return;

      const followers = await getFollowersCount(user.id);
      setFollowersCount(followers);

      const following = await getFollowingCount(user.id);
      setFollowingCount(following);
    }

    loadOwnStats();
  }, [user?.id, profile]);

  console.log("saved state:", {
    isShowingSaved,
    setIsShowingSaved,
  });

  return (
    <div className="absolute top-4 left-4 z-[3000]">
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
          className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
        >
          {profile?.avatar && (
            <img
              src={profile?.avatar}
              alt="avatar"
              className="w-11 h-11 rounded-full border border-white/10"
            />
          )}

          <div className="flex-1 text-left">
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm flex-1 truncate text-white">
                {profile?.display_name || user.name || user.email}

                {(profile as UserProfileType)?.user_tag && (
                  <span className="text-zinc-500 ml-1">
                    #{(profile as UserProfileType).user_tag}
                  </span>
                )}
              </p>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings();
                }}
                className="text-zinc-400 hover:text-white transition cursor-pointer p-1"
                title="Settings"
              >
                <Settings size={16} />
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
                className="text-red-400/70 hover:text-red-300 transition cursor-pointer p-1 ml-1"
                title="Log out"
              >
                <LogOut size={16} />
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
                  className="text-zinc-500 hover:text-white transition cursor-pointer p-0.5"
                  title="Edit status"
                >
                  <Pencil size={12} />
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
              transition-transform
              duration-300
              ${isProfileOpen ? "rotate-90" : ""}
            `}
          >
            <Menu size={20} />
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
                    className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>

                  <p className="text-sm font-semibold">All Pins</p>
                </div>

                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
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
                          <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-white/80 shrink-0">
                            <PinIcon type={pin.pin_type} />
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
                    className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back
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
                          if (props.onOpenUserProfile) {
                            props.onOpenUserProfile(u);
                          }
                          setIsProfileOpen(false);
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
                    className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>

                  <p className="text-sm font-semibold">Saved Pins</p>
                </div>

                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
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
                        <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-white/80 shrink-0">
                          <PinIcon type={pin.pin_type} />
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
                    <p className="font-bold text-sm text-white">
                      {
                        pins.filter(
                          (p) =>
                            String(p.user_id || "").trim() ===
                            String(user.id || "").trim(),
                        ).length
                      }
                    </p>
                    <p className="text-[10px] text-zinc-400">Pins</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">
                      {followersCount}
                    </p>
                    <p className="text-[10px] text-zinc-400">Followers</p>
                  </div>
                  <button
                    className="hover:bg-white/5 rounded-xl transition active:scale-95 text-center"
                    onClick={handleOpenFollowing}
                  >
                    <p className="font-bold text-sm text-white">
                      {followingCount}
                    </p>
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
                      className="text-xs text-zinc-400 hover:text-white transition"
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
                            <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-white/80 shrink-0">
                              <PinIcon type={pin.pin_type} />
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

                <div className="flex-1 rounded-2xl bg-white/5 p-3">
                  <button
                    onClick={() => setIsShowingSaved(true)}
                    className="w-full text-left"
                  >
                    <p className="text-lg font-bold text-white">
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
