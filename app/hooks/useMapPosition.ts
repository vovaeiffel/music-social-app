"use client";

export function useMapPosition() {
  if (typeof window === "undefined") {
    return {
      center: [51.505, -0.09] as [number, number],
      zoom: 2,
    };
  }

  const savedPosition = localStorage.getItem("map-position");

  if (!savedPosition) {
    return {
      center: [51.505, -0.09] as [number, number],
      zoom: 2,
    };
  }

  const parsed = JSON.parse(savedPosition);

  return {
    center: [parsed.lat, parsed.lng] as [number, number],
    zoom: parsed.zoom || 2,
  };
}
