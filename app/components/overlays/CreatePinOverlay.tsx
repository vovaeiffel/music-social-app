"use client";

import { memo } from "react";

import { useCreatePinStore } from "@/app/store/createPinStore";

import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

type Props = {
  lat: number;
  lng: number;

  createPin: () => void;

  onClose: () => void;
};
function CreatePinOverlay({ lat, lng, createPin, onClose }: Props) {
  const {
    songTitle,
    setSongTitle,

    artistName,
    setArtistName,

    story,
    setStory,

    youtubeUrl,
    setYoutubeUrl,

    spotifyUrl,
    setSpotifyUrl,

    yandexUrl,
    setYandexUrl,
  } = useCreatePinStore();
  const map = useMap();

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    function updatePosition() {
      const point = map.latLngToContainerPoint([lat, lng]);

      setPosition({
        x: point.x,
        y: point.y,
      });
    }

    updatePosition();

    map.on("move", updatePosition);
    map.on("zoom", updatePosition);

    return () => {
      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
    };
  }, [map, lat, lng]);

  function handleMusicLink(value: string) {
    if (value.includes("youtube.com") || value.includes("youtu.be")) {
      setYoutubeUrl(value);

      return;
    }

    if (value.includes("spotify.com")) {
      setSpotifyUrl(value);

      return;
    }

    if (value.includes("music.yandex")) {
      setYandexUrl(value);

      return;
    }
  }

  return (
    <div
      ref={(el) => {
        if (!el) return;

        L.DomEvent.disableClickPropagation(el);
        L.DomEvent.disableScrollPropagation(el);

        L.DomEvent.on(el, "mousedown", L.DomEvent.stopPropagation);
        L.DomEvent.on(el, "mouseup", L.DomEvent.stopPropagation);
        L.DomEvent.on(el, "dblclick", L.DomEvent.stopPropagation);
      }}
      className="
        absolute
        z-[3000]
        w-[320px]
        max-w-[85vw]
        
        pointer-events-auto
        "
      style={{
        left: position.x - 120,
        top: position.y - 220,
      }}
    >
      <div
        className="
      rounded-3xl
  
      bg-zinc-900/85
      supports-[backdrop-filter]:bg-zinc-900/70
  
      backdrop-blur-3xl
  
      border
      border-white/10
  
      shadow-[0_20px_80px_rgba(0,0,0,0.45)]
  
      p-4
  
      text-white
  
      origin-bottom
    "
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/90">New memory</h2>

          <button onClick={onClose} className="text-white/40 hover:text-white">
            ×
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Song"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            className="
              w-full
              rounded-xl
              bg-white/10
              border
              border-white/10
              px-3
              py-2
              text-sm
              outline-none
              placeholder:text-white/35
              "
          />

          <input
            type="text"
            placeholder="Artist"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="
        w-full
        rounded-xl
        bg-white/5
        border
        border-white/10
        px-3
        py-2
        text-sm
        outline-none
      "
          />

          <textarea
            placeholder="Your memory..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
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
        text-sm
        outline-none
      "
          />

          <input
            type="text"
            placeholder="Paste YouTube / Spotify / Yandex link"
            onChange={(e) => handleMusicLink(e.target.value)}
            className="
    w-full
    rounded-xl
    bg-white/5
    border
    border-white/10
    px-3
    py-2
    text-sm
    outline-none
    placeholder:text-white/35
  "
          />

          <button
            onClick={createPin}
            className="
        w-full
        rounded-xl
        bg-white
        text-black
        py-2
        text-sm
        font-medium
        hover:scale-[1.02]
        transition
      "
          >
            Create memory
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(CreatePinOverlay);
