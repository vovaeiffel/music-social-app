"use client";

import type { PinType } from "@/app/types/pin";
import type { UserProfileType } from "@/app/types/user";
import { useState } from "react";

type Props = {
  user: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  };

  profile: UserProfileType | null;

  pins: PinType[];

  isProfileOpen: boolean;

  setSelectedPin: (pin: PinType) => void;

  onLogout: () => void;

  onOpenSettings: () => void;

  setIsProfileOpen: (value: boolean) => void;

  openProfileOverlay: () => void;
};

export default function ProfilePanel({
  user,
  profile,
  pins,
  setSelectedPin,
  onLogout,
  onOpenSettings,
  isProfileOpen,
  setIsProfileOpen,
  openProfileOverlay,
}: Props) {
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const [showAllPins, setShowAllPins] = useState(false);

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

              <button
                onClick={(e) => {
                  e.stopPropagation();

                  onOpenSettings();
                }}
                className="
      text-sm
      text-zinc-400
      hover:text-white
      transition
    "
              >
                ⚙️
              </button>

              <button
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
    "
              >
                ⛔
              </button>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-zinc-400">
                  {profile?.status || "music explorer"}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSettings();
                  }}
                  className="
        text-[10px]
        text-zinc-500
        hover:text-white
        transition
      "
                >
                  ✎
                </button>
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
            ) : (
              <div className="pt-4 space-y-4">
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
                  <p className="text-lg font-bold">0</p>

                  <p className="text-xs text-zinc-400">Saved</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
