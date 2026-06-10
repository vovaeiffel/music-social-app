import { create } from "zustand";

type CreatePinStore = {
  songTitle: string;
  setSongTitle: (value: string) => void;

  artistName: string;
  setArtistName: (value: string) => void;

  story: string;
  setStory: (value: string) => void;

  placeName: string;
  setPlaceName: (value: string) => void;

  links: string[];
  setLink: (index: number, value: string) => void;

  // Добавляем поля для загрузки одной фотографии
  imageFile: File | null;
  setImageFile: (file: File | null) => void;

  selectedLat: number | null;
  setSelectedLat: (lat: number | null) => void;

  selectedLng: number | null;
  setSelectedLng: (lng: number | null) => void;

  isCreatingPin: boolean;
  setIsCreatingPin: (value: boolean) => void;

  selectedPinType: string | null;
  setSelectedPinType: (type: string | null) => void;

  editingPinId: string | null;
  setEditingPinId: (id: string | null) => void;

  color: string;
  setColor: (value: string) => void;

  visibility: "global" | "private" | "following";
  setVisibility: (value: "global" | "private" | "following") => void;

  resetForm: () => void;
};

export const useCreatePinStore = create<CreatePinStore>((set) => ({
  songTitle: "",
  setSongTitle: (value) => set({ songTitle: value }),

  artistName: "",
  setArtistName: (value) => set({ artistName: value }),

  story: "",
  setStory: (value) => set({ story: value }),

  placeName: "",
  setPlaceName: (value) => set({ placeName: value }),

  links: [""],

  setLink: (index, value) =>
    set((state) => {
      const newLinks = [...state.links];
      newLinks[index] = value;

      if (
        value.trim() !== "" &&
        index === newLinks.length - 1 &&
        newLinks.length < 5
      ) {
        newLinks.push("");
      }

      while (
        newLinks.length > 1 &&
        newLinks[newLinks.length - 1].trim() === "" &&
        newLinks[newLinks.length - 2].trim() === ""
      ) {
        newLinks.pop();
      }

      return { links: newLinks };
    }),

  // Реализация функций и начального состояния для фото
  imageFile: null,
  setImageFile: (file) => set({ imageFile: file }),

  selectedLat: null,
  setSelectedLat: (lat) => set({ selectedLat: lat }),

  selectedLng: null,
  setSelectedLng: (lng) => set({ selectedLng: lng }),

  isCreatingPin: false,
  setIsCreatingPin: (value) => set({ isCreatingPin: value }),

  selectedPinType: null,
  setSelectedPinType: (type) => set({ selectedPinType: type }),

  editingPinId: null,
  setEditingPinId: (id) => set({ editingPinId: id }),

  color: "#8B5CF6",
  setColor: (value) => set({ color: value }),

  visibility: "global",
  setVisibility: (value) => set({ visibility: value }),

  resetForm: () =>
    set({
      songTitle: "",
      artistName: "",
      story: "",
      placeName: "",
      links: [""],
      imageFile: null, // Сбрасываем выбранную картинку
      selectedLat: null,
      selectedLng: null,
      editingPinId: null,
      isCreatingPin: false,
      selectedPinType: null,
      visibility: "global",
      color: "#8B5CF6",
    }),
}));
