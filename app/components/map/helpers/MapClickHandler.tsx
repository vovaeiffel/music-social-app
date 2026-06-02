"use client";

import { useMapEvents } from "react-leaflet";

import type { PinType } from "@/app/types/pin";

type Props = {
  setSelectedLat: (lat: number) => void;

  setSelectedLng: (lng: number) => void;

  setIsCreatingPin: (value: boolean) => void;

  selectedPinType: string | null;

  setSelectedPin: (pin: PinType | null) => void;

  isCreatingPin: boolean;
};

export default function MapClickHandler({
  setSelectedPin,
  setSelectedLat,
  setSelectedLng,
  setIsCreatingPin,
  selectedPinType,
  isCreatingPin,
}: Props) {
  useMapEvents({
    click(e) {
      setSelectedPin(null);

      if (!selectedPinType || isCreatingPin) return;

      setSelectedLat(e.latlng.lat);

      setSelectedLng(e.latlng.lng);

      setIsCreatingPin(true);
    },
  });

  return null;
}
