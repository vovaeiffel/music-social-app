"use client";

import { useEffect } from "react";

import { useMap } from "react-leaflet";

import type { PinType } from "@/app/types/pin";

type Props = {
  pin: PinType | null;
};

export default function FlyToPin({ pin }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!pin) return;

    map.flyTo([pin.latitude, pin.longitude], 15, {
      duration: 0.6,
    });
  }, [pin, map]);

  return null;
}
