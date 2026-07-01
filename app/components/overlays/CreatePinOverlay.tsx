"use client";

import { memo } from "react";
import { useCreatePinStore } from "@/app/store/createPinStore";

import L from "leaflet";
import { detectMusicPlatform } from "@/app/utils/musicEmbed";
import { useOverlayPosition } from "@/app/hooks/useOverlayPosition";
import PinImageUpload from "./PinImageUpload";
import PinCategoryPicker from "./PinCategoryPicker";
import PinVisibilityPicker from "./PinVisibilityPicker";

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
    links,
    setLink,
  } = useCreatePinStore();

  const { position } = useOverlayPosition(lat, lng);

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
      className="absolute z-[3000] w-[320px] max-w-[85vw] pointer-events-auto"
      style={{
        left: position.x - 120,
        top: position.y - 220,
      }}
    >
      <div className="rounded-3xl bg-zinc-900/85 supports-[backdrop-filter]:bg-zinc-900/70 backdrop-blur-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-4 text-white origin-bottom max-h-[85vh] flex flex-col overflow-hidden">
        {/* ШАПКА ОВЕРЛЕЯ */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/90">New memory</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-lg"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {/* ТРЕК */}
          <input
            type="text"
            placeholder="Song"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/35"
          />

          {/* ИСПОЛНИТЕЛЬ */}
          <input
            type="text"
            placeholder="Artist"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
          />

          {/* ИСТОРИЯ */}
          <textarea
            placeholder="Your memory..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full h-24 resize-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
          />

          {/* ЗАГРУЗКА ФОТО */}
          <PinImageUpload />

          {/* ДИНАМИЧЕСКИЕ ПОЛЯ ДЛЯ ССЫЛОК */}
          <div className="flex flex-col gap-2 my-2">
            <span className="text-[11px] font-medium text-white/60 text-left px-1 flex justify-between items-center">
              <span>Music links (max 5):</span>
              <span className="text-zinc-500 text-[10px]">
                {links.filter((l: string) => l.trim() !== "").length} / 5
              </span>
            </span>

            <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
              {links.map((link: string, index: number) => {
                const platform = detectMusicPlatform(link);

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-white/20 transition-all"
                  >
                    <span
                      className={`text-base ${platform.color}`}
                      title={platform.name}
                    >
                      {platform.icon}
                    </span>

                    <input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(index, e.target.value)}
                      placeholder="Paste link..."
                      className="w-full bg-transparent text-xs text-white outline-none placeholder-zinc-500"
                    />

                    {link.trim() !== "" && (
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${platform.color}`}
                      >
                        {platform.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ВЫБОР ТИПА/КАТЕГОРИИ ПИНА */}
          <PinCategoryPicker />

          {/* ВИДИМОСТЬ И ЦВЕТ */}
          <PinVisibilityPicker />

          {/* КНОПКА СОЗДАНИЯ */}
          <button
            onClick={createPin}
            className="w-full rounded-xl bg-white text-black py-2 text-sm font-medium hover:scale-[1.02] transition"
          >
            Create memory
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(CreatePinOverlay);
