"use client";

import { Globe, Music } from "lucide-react";
import SearchBar from "@/app/components/overlays/SearchBar"; // Убедись, что путь к SearchBar верный

type MapMode = "global" | "personal" | "guest";

type Props = {
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
  setSearchPos: (pos: [number, number]) => void;
};

export default function MapControls({
  mapMode,
  setMapMode,
  setSearchPos,
}: Props) {
  return (
    <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-[2000] flex flex-col md:flex-row items-center gap-3 pointer-events-auto">
      {/* 1. Поиск */}
      <div className="w-[300px]">
        <SearchBar
          onSelectLocation={(lat: number, lng: number) =>
            setSearchPos([lat, lng])
          }
        />
      </div>

      {/* 2. Кнопки переключения режима карты */}
      <div className="flex bg-zinc-900/85 backdrop-blur-2xl p-1 rounded-2xl border border-white/10 shadow-2xl gap-1">
        <button
          onClick={() => setMapMode("global")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            mapMode === "global"
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Globe size={16} strokeWidth={mapMode === "global" ? 2.5 : 2} />
          <span>Global Map</span>
        </button>
        <button
          onClick={() => setMapMode("personal")}
          className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            mapMode === "personal"
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Music size={16} strokeWidth={mapMode === "personal" ? 2.5 : 2} />
          <span>My Map</span>
        </button>
      </div>
    </div>
  );
}
