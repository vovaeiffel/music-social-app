"use client";

import { usePinStore } from "@/app/store/pinStore";

import { memo } from "react";

import { FaYoutube, FaSpotify } from "react-icons/fa";

import { useEffect, useState } from "react";

import type { PinType } from "@/app/types/pin";

import { useMap } from "react-leaflet";

import { motion } from "framer-motion";

import L from "leaflet";

type Props = {
  onClose: () => void;

  toggleLike: (pinId: string, liked: boolean) => void;

  currentUserId?: string;

  onEditPin: (pin: PinType) => void;

  onDeletePin: (pinId: string) => void;
};

function SelectedPinOverlay({
  onClose,
  toggleLike,
  currentUserId,
  onEditPin,
  onDeletePin,
}: Props) {
  const selectedPin = usePinStore((state) => state.selectedPin);

  const pin = selectedPin;
  const map = useMap();

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (!pin) return;

    function updatePosition() {
      if (!pin) return;

      const point = map.latLngToContainerPoint([pin.latitude, pin.longitude]);

      setPosition({
        x: point.x,
        y: point.y,
      });

      const zoom = map.getZoom();

      const scale = 0.25 + zoom * 0.08;

      setZoomScale(scale);
    }

    updatePosition();

    map.on("move", updatePosition);
    map.on("zoom", updatePosition);

    return () => {
      map.off("move", updatePosition);

      map.off("zoom", updatePosition);
    };
  }, [pin, map]);

  if (!pin) return null;

  return (
    <motion.div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      initial={{
        opacity: 0,
        scale: 0.7,
        y: 30,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: zoomScale * 0.9,
        y: 10,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
      className="
      absolute
      z-[9999]
    "
      style={{
        left: position.x - 360,
        top: position.y - 80,
      }}
    >
      <div
        ref={(el) => {
          if (!el) return;

          L.DomEvent.disableClickPropagation(el);
          L.DomEvent.disableScrollPropagation(el);
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        className="
      w-[320px]
      max-w-[85vw]
  
      rounded-3xl
  
      bg-zinc-900/85
      supports-[backdrop-filter]:bg-zinc-900/70
  
      backdrop-blur-3xl
  
      border
      border-white/10
  
      shadow-[0_20px_80px_rgba(0,0,0,0.45)]
  
      p-4
  
      text-white
      pointer-events-auto
    "
      >
        <div
          className="
              flex
              justify-between
              items-start
              mb-3
            "
        >
          <div className="flex items-center gap-2 mb-3">
            {pin.user_avatar && (
              <img
                src={pin.user_avatar}
                alt="avatar"
                className="w-7 h-7 rounded-full"
              />
            )}

            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {pin.user_name || "Unknown"}
              </p>

              <p className="text-[11px] text-white/40">music memory</p>
            </div>
          </div>

          <div>
            <h2
              className="
                 text-base
  font-semibold
                "
            >
              {pin.song_title}
            </h2>

            <p
              className="
                  text-zinc-400
                "
            >
              {pin.artist_name}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();

              onClose();
            }}
            className="
                text-white/50 text-sm
                hover:text-white
              "
          >
            ×
          </button>
        </div>

        <p
          className="
              text-[13px]
  leading-relaxed
  text-white/80
  mb-4
            "
        >
          {pin.story}
        </p>

        {pin.music_links && pin.music_links.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {pin.music_links && pin.music_links.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {pin.music_links.map((link, index) => {
                  let icon = null;
                  let bg = "";
                  let glowColor = "";
                  let hoverGlow = "";

                  if (link.type === "youtube") {
                    icon = <FaYoutube size={20} />;
                    bg = "bg-red-500/90 hover:bg-red-500";
                    hoverGlow = "hover:shadow-red-500/70";
                    glowColor = "rgba(239,68,68,0.9)";
                  }

                  if (link.type === "spotify") {
                    icon = <FaSpotify size={20} />;
                    bg = "bg-green-500/90 hover:bg-green-500";
                    hoverGlow = "hover:shadow-green-500/70";
                    glowColor = "rgba(34,197,94,0.9)";
                  }

                  if (link.type === "yandex") {
                    icon = (
                      <img
                        src="/icons/yandex_music.png"
                        alt="Yandex Music"
                        className="w-11 h-11 rounded-full"
                      />
                    );
                    hoverGlow = "hover:shadow-orange-400/70";

                    glowColor = "rgba(251,146,60,0.9)";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => window.open(link.url, "_blank")}
                      style={{
                        boxShadow: `0 4px 18px rgba(0,0,0,0.35)`,
                      }}
                      className={`
                        w-11
                        h-11
                        rounded-full
                      
                        flex
                        items-center
                        justify-center
                      
                        text-lg
                      
                        border
                        border-white/10
                      
                        backdrop-blur-xl
                      
                        shadow-lg
                        shadow-black/30
                      
                        transition-all
                        duration-300
                      
                        hover:scale-110
                        hover:-translate-y-1
                      
                        hover:shadow-2xl

                        ${hoverGlow}
                      
                        active:scale-95
                      
                        ${bg}
                      `}
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div
          className="
      flex
      items-center
      justify-between
      mt-4
    "
        >
          <button
            onClick={(e) => {
              e.stopPropagation();

              toggleLike(pin.id, pin.liked_by_user || false);
            }}
            className="
        text-sm
        hover:scale-105
        transition
      "
          >
            {pin.liked_by_user ? "❤️" : "🤍"} {pin.likes_count || 0}
          </button>

          {currentUserId === pin.user_id && (
            <div className="flex gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  onEditPin(pin);
                }}
                className="
            text-sm
            text-blue-400
            hover:text-blue-300
          "
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();

                  onDeletePin(pin.id);
                }}
                className="
            text-sm
            text-red-400
            hover:text-red-300
          "
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(SelectedPinOverlay);
