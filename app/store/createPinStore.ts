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

  youtubeUrl: string;
  setYoutubeUrl: (value: string) => void;

  spotifyUrl: string;
  setSpotifyUrl: (value: string) => void;

  yandexUrl: string;
  setYandexUrl: (value: string) => void;

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

  youtubeUrl: "",
  setYoutubeUrl: (value) => set({ youtubeUrl: value }),

  spotifyUrl: "",
  setSpotifyUrl: (value) => set({ spotifyUrl: value }),

  yandexUrl: "",
  setYandexUrl: (value) => set({ yandexUrl: value }),

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

  resetForm: () =>
    set({
      songTitle: "",
      artistName: "",
      story: "",
      placeName: "",

      youtubeUrl: "",
      spotifyUrl: "",
      yandexUrl: "",

      selectedLat: null,
      selectedLng: null,

      editingPinId: null,

      isCreatingPin: false,
    }),
}));
