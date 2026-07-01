import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";

export function useOverlayPosition(lat: number, lng: number) {
  const map = useMap();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function updatePosition() {
      requestAnimationFrame(() => {
        if (!map) return;
        const point = map.latLngToContainerPoint([lat, lng]);
        setPosition({ x: point.x, y: point.y });
      });
    }

    updatePosition();
    map.on("move", updatePosition);
    map.on("zoom", updatePosition);

    return () => {
      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
    };
  }, [map, lat, lng]);

  return { position };
}
