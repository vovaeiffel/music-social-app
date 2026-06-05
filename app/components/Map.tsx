"use client";

// 1. ИСПРАВЛЕНО: Добавили useMapEvents в импорт из react-leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { getPinIcon } from "./CustomMarker";
import { useCreatePinStore } from "@/app/store/createPinStore";

import L from "leaflet";

import { clusterOptions } from "./map/config/clusterConfig";
import SearchBar from "./overlays/SearchBar";

import MapClickHandler from "./map/helpers/MapClickHandler";
import { useMapPosition } from "@/app/hooks/useMapPosition";
import { handleClusterClick } from "./map/helpers/handleClusterClick";
import { usePinStore } from "@/app/store/pinStore";

import type { PinType } from "@/app/types/pin";

import SaveMapPosition from "./map/helpers/SaveMapPosition";
import FlyToPin from "./map/helpers/FlyToPin";
import MarkersLayer from "./map/MarkersLayer";

import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet.markercluster";

import CreatePinOverlay from "./overlays/CreatePinOverlay";
import SelectedPinOverlay from "./overlays/SelectedPinOverlay";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useState } from "react";

// Вспомогательный компонент для перехвата событий карты
function MapEventsHandler({
  onMapDblClick,
}: {
  onMapDblClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    dblclick(e: L.LeafletMouseEvent) {
      // <-- ПРОПИСАЛИ ЧЕРЕЗ L.
      onMapDblClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type Props = {
  pins: PinType[];
  createPin: () => void;
  toggleLike: (pinId: string, liked: boolean) => void;
  currentUserId?: string;
  onEditPin: (pin: PinType) => void;
  onDeletePin: (pinId: string) => void;
  onOpenUserProfile: (userId: string) => void;
  onPrepareNewPin: () => void;
  searchPos: [number, number] | null;
};

// Вспомогательный компонент для управления камерой
function FlyToHandler({ position }: { position: [number, number] | null }) {
  const map = useMap();
  if (position) {
    map.flyTo(position, 14);
  }
  return null;
}

export default function Map({
  pins,
  createPin,
  toggleLike,
  currentUserId,
  onEditPin,
  onDeletePin,
  onOpenUserProfile,
  searchPos,
}: Props) {
  // Достаем нужные функции, включая resetForm
  const {
    selectedPinType,
    selectedLat,
    setSelectedLat,
    selectedLng,
    setSelectedLng,
    isCreatingPin,
    setIsCreatingPin,
    resetForm, // <-- ДОБАВИЛИ СЮДА
  } = useCreatePinStore();

  useEffect(() => {
    console.log("DEBUG: Map state changed:", {
      isCreatingPin,
      selectedLat,
      selectedLng,
    });
  }, [isCreatingPin, selectedLat, selectedLng]);

  const selectedPin = usePinStore((state) => state.selectedPin);
  const setSelectedPin = usePinStore((state) => state.setSelectedPin);
  const { center, zoom } = useMapPosition();

  const handleCloseSelectedPin = useCallback(() => {
    setSelectedPin(null);
  }, [setSelectedPin]);

  const handleCloseCreatePin = useCallback(() => {
    resetForm(); // <-- ЭТО КЛЮЧЕВОЙ МОМЕНТ: сбрасывает lat, lng и все текстовые поля в Zustand
    setIsCreatingPin(false);
  }, [resetForm, setIsCreatingPin]);

  // 3. ИСПРАВЛЕНО: Объявили обработчик дабл-клика внутри основного компонента
  const handleMapDblClick = (lat: number, lng: number) => {
    resetForm(); // Полностью очищаем поля формы
    setSelectedLat(lat); // Записываем широту
    setSelectedLng(lng); // Записываем долготу
    setIsCreatingPin(true); // Открываем оверлей создания пина!
  };

  console.log("pins", pins);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
      className="rounded-2xl overflow-hidden"
    >
      <MapContainer
        zoomAnimation={true}
        fadeAnimation={true}
        doubleClickZoom={false} // <-- ВАЖНО: Отключили зум по дабл-клику!
        markerZoomAnimation={true}
        zoomAnimationThreshold={1}
        className={selectedPinType ? "cursor-crosshair" : ""}
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        preferCanvas={true}
        style={{
          height: "100vh",
          width: "100%",
        }}
        attributionControl={false}
      >
        <FlyToHandler position={searchPos} />
        <SaveMapPosition />
        <FlyToPin pin={selectedPin} />

        {/* 4. ДОБАВИЛИ: Наш обработчик двойного клика встал внутрь карты */}
        <MapEventsHandler onMapDblClick={handleMapDblClick} />

        {selectedPin && (
          <SelectedPinOverlay
            onClose={handleCloseSelectedPin}
            toggleLike={toggleLike}
            currentUserId={currentUserId}
            onEditPin={onEditPin}
            onDeletePin={onDeletePin}
            onOpenUserProfile={onOpenUserProfile}
          />
        )}

        {isCreatingPin && (
          <CreatePinOverlay
            lat={selectedLat || 0} // Добавляем дефолтное значение 0, если вдруг null
            lng={selectedLng || 0}
            createPin={createPin}
            onClose={handleCloseCreatePin}
          />
        )}

        <TileLayer
          attribution="&copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler
          setSelectedPin={setSelectedPin}
          setSelectedLat={setSelectedLat}
          setSelectedLng={setSelectedLng}
          setIsCreatingPin={setIsCreatingPin}
          selectedPinType={selectedPinType}
          isCreatingPin={isCreatingPin}
        />

        {selectedLat !== null && selectedLng !== null && selectedPinType && (
          <Marker
            position={[selectedLat, selectedLng]}
            icon={getPinIcon(selectedPinType)}
          >
            <Popup>
              <div className="text-black">New pin position</div>
            </Popup>
          </Marker>
        )}

        <MarkerClusterGroup
          {...clusterOptions}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={handleClusterClick}
        >
          <MarkersLayer pins={pins} />
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
