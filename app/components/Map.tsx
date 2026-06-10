"use client";

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
// import SearchBar from "./overlays/SearchBar"; // закомментировано, если не используется явно ниже

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

// Список доступных карт (рельеф, темная, спутник и т.д.)
const MAP_STYLES = [
  {
    name: "Стандартная",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "&copy; CARTO",
    hasLabels: false,
  },
  {
    name: "OpenStreetMap (Подробная)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    hasLabels: false, // На ней уже есть все подписи и дороги
  },
  {
    name: "Тёмная",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; CARTO",
    hasLabels: false,
  },
  {
    name: "Спутник",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    hasLabels: true, // Прозрачный оверлей с названиями остается для спутника
  },
  {
    name: "Минималистичная",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; CARTO",
    hasLabels: false,
  },
];

// Вспомогательный компонент для перехвата событий карты
function MapEventsHandler({
  onMapDblClick,
}: {
  onMapDblClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    dblclick(e: L.LeafletMouseEvent) {
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
  // Состояние для хранения выбранной подложки карты (по умолчанию первая)
  const [currentMap, setCurrentMap] = useState(MAP_STYLES[0]);

  const {
    selectedPinType,
    selectedLat,
    setSelectedLat,
    selectedLng,
    setSelectedLng,
    isCreatingPin,
    setIsCreatingPin,
    resetForm,
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
    resetForm();
    setIsCreatingPin(false);
  }, [resetForm, setIsCreatingPin]);

  const handleMapDblClick = (lat: number, lng: number) => {
    resetForm();
    setSelectedLat(lat);
    setSelectedLng(lng);
    setIsCreatingPin(true);
  };

  console.log("pins", pins);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
      className="rounded-2xl overflow-hidden relative"
    >
      {/* Меню выбора карт поверх карты (справа вверху) */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-zinc-200 flex flex-col gap-1.5 max-w-[200px]">
        <span className="text-xs font-semibold text-zinc-700 px-1">
          Стиль карты:
        </span>
        {MAP_STYLES.map((style) => (
          <button
            key={style.name}
            onClick={() => setCurrentMap(style)}
            className={`text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
              currentMap.name === style.name
                ? "bg-blue-600 text-white font-medium"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {style.name}
          </button>
        ))}
      </div>

      <MapContainer
        zoomAnimation={true}
        fadeAnimation={true}
        doubleClickZoom={false}
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
            lat={selectedLat || 0}
            lng={selectedLng || 0}
            createPin={createPin}
            onClose={handleCloseCreatePin}
          />
        )}

        {/* Динамическая подложка карты, меняющаяся по клику в меню */}
        <TileLayer attribution={currentMap.attribution} url={currentMap.url} />
        {currentMap.hasLabels && (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO contributors"
            pane="overlayPane" // Гарантирует, что лейблы рисуются поверх базовой карты
          />
        )}

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

        <MarkerClusterGroup {...clusterOptions} onClick={handleClusterClick}>
          <MarkersLayer pins={pins} />
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
