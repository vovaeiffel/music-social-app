"use client";

import { useMapEvents } from "react-leaflet";

export default function SaveMapPosition() {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();

      localStorage.setItem(
        "map-position",
        JSON.stringify({
          lat: center.lat,
          lng: center.lng,
          zoom: map.getZoom(),
        }),
      );
    },
  });

  return null;
}
