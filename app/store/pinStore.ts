import { create } from "zustand";

import type { PinType } from "@/app/types/pin";

type PinStore = {
  selectedPin: PinType | null;

  setSelectedPin: (pin: PinType | null) => void;
};

export const usePinStore = create<PinStore>((set) => ({
  selectedPin: null,

  setSelectedPin: (pin) => set({ selectedPin: pin }),
}));
