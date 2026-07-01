import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import type { PinType } from "@/app/types/pin";

export function usePinCardPosition(pin: PinType | null) {
  const map = useMap();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (!pin) return;

    function updatePosition() {
      if (!pin) return;
      const point = map.latLngToContainerPoint([pin.latitude, pin.longitude]);
      setPosition({ x: point.x, y: point.y });
      const zoom = map.getZoom();
      setZoomScale(0.25 + zoom * 0.08);
    }

    updatePosition();
    map.on("move", updatePosition);
    map.on("zoom", updatePosition);

    return () => {
      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
    };
  }, [pin, map]);

  return { position, zoomScale };
}
