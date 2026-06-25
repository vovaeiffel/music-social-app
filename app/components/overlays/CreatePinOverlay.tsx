"use client";

import { memo, useRef } from "react";
import { useCreatePinStore } from "@/app/store/createPinStore";

import {
  Music,
  Mic,
  Car,
  Tent,
  Moon,
  Sun,
  User,
  Headphones,
  Guitar,
  Sparkles,
  Wine,
  Beer,
  Trophy,
  Plane,
  Heart,
  Flame,
  Dumbbell,
  Clapperboard,
  Camera,
  Coffee,
  X,
  ImagePlus,
} from "lucide-react";

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
    links,
    setLink,
    visibility,
    setVisibility,
    color,
    setColor,
    selectedPinType, // <- убедитесь, что название совпадает с вашим стором (selectedPinType или pinType)
    setSelectedPinType,
    imageFile, // Должно быть добавлено в ваш useCreatePinStore
    setImageFile, // Должно быть добавлено в ваш useCreatePinStore
  } = useCreatePinStore(); // Временно as any для избежания ошибок типизации, если стор еще не типизирован

  const map = useMap();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  // Локальный стейт для превью картинки (чтобы не гонять тяжелые файлы по стору)
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    function updatePosition() {
      requestAnimationFrame(() => {
        if (!map) return;
        const point = map.latLngToContainerPoint([lat, lng]);
        setPosition({
          x: point.x,
          y: point.y,
        });
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

  function detectMusicPlatform(url: string) {
    if (!url) return { name: "Link", color: "text-zinc-400", icon: "🔗" };

    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
      return { name: "YouTube", color: "text-red-500", icon: "📺" };
    }
    if (lowerUrl.includes("spotify.com") || lowerUrl.includes("open.spotify")) {
      return { name: "Spotify", color: "text-green-500", icon: "🎵" };
    }
    if (lowerUrl.includes("yandex.ru") || lowerUrl.includes("music.yandex")) {
      return { name: "Яндекс.Музыка", color: "text-yellow-500", icon: "🎧" };
    }
    return { name: "Link", color: "text-indigo-400", icon: "🔗" };
  }

  // Обработчик выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка: разрешаем только изображения
      if (!file.type.startsWith("image/")) {
        alert("Пожалуйста, выберите изображение.");
        return;
      }
      // Ограничение: размер не более 5 МБ (чтобы не забить хранилище Firebase)
      if (file.size > 5 * 1024 * 1024) {
        alert("Размер файла не должен превышать 5 МБ.");
        return;
      }

      // Сохраняем файл в глобальный стор
      if (setImageFile) setImageFile(file);

      // Создаем URL для предпросмотра
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Удаление выбранной фотографии
  const handleRemoveImage = () => {
    if (setImageFile) setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
          <div className="flex flex-col gap-1.5 my-2">
            <span className="text-[11px] font-medium text-white/60 text-left px-1">
              Add photo (max 1, up to 5MB):
            </span>

            {/* Скрытый инпут файла */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-dashed border-white/20 hover:bg-white/10 transition text-xs text-zinc-300"
              >
                <ImagePlus size={16} />
                <span>Select photo</span>
              </button>
            ) : (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/10 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-full transition shadow-md"
                  title="Удалить фото"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

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
          <div className="flex flex-col gap-1.5 my-2">
            <span className="text-[11px] font-medium text-white/60 text-left px-1">
              Select memory category:
            </span>

            <div
              className="max-h-[108px] overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10 scrollbar-thin"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="grid grid-cols-5 gap-2 justify-items-center">
                {[
                  { type: "music", Icon: Music, label: "Music" },
                  { type: "concert", Icon: Mic, label: "Gig" },
                  { type: "roadtrip", Icon: Car, label: "Trip" },
                  { type: "camping", Icon: Tent, label: "Camp" },
                  { type: "night", Icon: Moon, label: "Night" },
                  { type: "summer", Icon: Sun, label: "Summer" },
                  { type: "person", Icon: User, label: "With someone" },
                  { type: "headphones", Icon: Headphones, label: "Headphones" },
                  { type: "guitar", Icon: Guitar, label: "Live" },
                  { type: "party", Icon: Sparkles, label: "Party" },
                  { type: "bar", Icon: Wine, label: "Wine" },
                  { type: "pub", Icon: Beer, label: "Pub" },
                  { type: "festival", Icon: Trophy, label: "Event" },
                  { type: "travel", Icon: Plane, label: "Travel" },
                  { type: "love", Icon: Heart, label: "Love" },
                  { type: "chill", Icon: Flame, label: "Chill" },
                  { type: "sport", Icon: Dumbbell, label: "Sport" },
                  {
                    type: "cinema",
                    Icon: Clapperboard,
                    label: "Movie / Video",
                  },
                  { type: "photo", Icon: Camera, label: "Photo / Spot" },
                  { type: "cafe", Icon: Coffee, label: "Cafe / Chill" },
                ].map((item) => {
                  const IsSelected = selectedPinType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() =>
                        setSelectedPinType(IsSelected ? null : item.type)
                      }
                      className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 active:scale-95 ${
                        IsSelected
                          ? "bg-white text-black scale-105 shadow-md"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                      title={item.label}
                    >
                      <item.Icon size={20} strokeWidth={IsSelected ? 2.5 : 2} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ВЫБОР РЕЖИМА ВИДИМОСТИ ПИНА */}
          <div className="flex flex-col gap-1.5 my-2">
            <span className="text-[11px] font-medium text-white/60 text-left px-1">
              Who can see this memory?
            </span>

            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`py-1.5 text-xs font-medium rounded-lg transition ${
                  visibility === "private"
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🔒 Only Me
              </button>

              <button
                type="button"
                onClick={() => setVisibility("following")}
                className={`py-1.5 text-xs font-medium rounded-lg transition ${
                  visibility === "following"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                👥 Friends
              </button>

              <button
                type="button"
                onClick={() => setVisibility("global")}
                className={`py-1.5 text-xs font-medium rounded-lg transition ${
                  visibility === "global"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                🌐 Global
              </button>
            </div>

            <span className="text-[10px] text-zinc-400 text-left px-1 mt-0.5">
              {visibility === "private" &&
                "Visible only to you on your personal map."}
              {visibility === "following" &&
                "Visible to you and people visiting your profile."}
              {visibility === "global" &&
                "Visible to everyone on the Global Map."}
            </span>
          </div>

          {/* ВЫБОР ЦВЕТА */}
          {visibility === "global" && (
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 my-2">
              <span className="text-[11px] font-medium text-white/60 block mb-2 text-left">
                Choose memory color vibe:
              </span>
              <div className="flex items-center justify-between gap-1.5 px-1">
                {[
                  "#EF4444",
                  "#F97316",
                  "#EAB308",
                  "#22C55E",
                  "#06B6D4",
                  "#3B82F6",
                  "#8B5CF6",
                  "#EC4899",
                ].map((paletteColor) => (
                  <button
                    key={paletteColor}
                    type="button"
                    onClick={() => setColor(paletteColor)}
                    className="w-6 h-6 rounded-full transition-all duration-200 relative shrink-0 active:scale-90 hover:scale-110"
                    style={{ backgroundColor: paletteColor }}
                  >
                    {color === paletteColor && (
                      <span className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

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
