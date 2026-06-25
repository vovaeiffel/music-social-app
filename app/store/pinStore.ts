import { create } from "zustand";
import type { PinType } from "@/app/types/pin";

type PinStore = {
  pins: PinType[]; // Добавили массив пинов
  selectedPin: PinType | null;

  setPins: (pins: PinType[]) => void; // Добавили метод для обновления
  setSelectedPin: (pin: PinType | null) => void;
};

export const usePinStore = create<PinStore>((set) => ({
  pins: [], // Изначально пустой массив
  selectedPin: null,

  setPins: (pins) => set({ pins }), // Реализация метода
  setSelectedPin: (pin) => set({ selectedPin: pin }),
}));
