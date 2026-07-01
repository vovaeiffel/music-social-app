"use client";

import { useCreatePinStore } from "@/app/store/createPinStore";

const COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

export default function PinVisibilityPicker() {
  const { visibility, setVisibility, color, setColor } = useCreatePinStore();

  return (
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
        {visibility === "global" && "Visible to everyone on the Global Map."}
      </span>

      {visibility === "global" && (
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 mt-1">
          <span className="text-[11px] font-medium text-white/60 block mb-2 text-left">
            Choose memory color vibe:
          </span>
          <div className="flex items-center justify-between gap-1.5 px-1">
            {COLORS.map((paletteColor) => (
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
    </div>
  );
}
