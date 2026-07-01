"use client";

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
} from "lucide-react";
import { useCreatePinStore } from "@/app/store/createPinStore";

const CATEGORIES = [
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
  { type: "cinema", Icon: Clapperboard, label: "Movie / Video" },
  { type: "photo", Icon: Camera, label: "Photo / Spot" },
  { type: "cafe", Icon: Coffee, label: "Cafe / Chill" },
];

export default function PinCategoryPicker() {
  const { selectedPinType, setSelectedPinType } = useCreatePinStore();

  return (
    <div className="flex flex-col gap-1.5 my-2">
      <span className="text-[11px] font-medium text-white/60 text-left px-1">
        Select memory category:
      </span>

      <div
        className="max-h-[108px] overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10 scrollbar-thin"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="grid grid-cols-5 gap-2 justify-items-center">
          {CATEGORIES.map((item) => {
            const isSelected = selectedPinType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() =>
                  setSelectedPinType(isSelected ? null : item.type)
                }
                className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "bg-white text-black scale-105 shadow-md"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
                title={item.label}
              >
                <item.Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
