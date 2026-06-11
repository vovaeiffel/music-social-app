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
    hasLabels: false,
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
    hasLabels: true,
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
  currentUserName: string;
  currentUserAvatar: string;
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
  currentUserName,
  currentUserAvatar,
}: Props) {
  // Состояние для хранения выбранной подложки карты (по умолчанию первая)
  const [currentMap, setCurrentMap] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMapName = localStorage.getItem("map_style");
      const style = MAP_STYLES.find((s) => s.name === savedMapName);
      if (style) return style;
    }
    return MAP_STYLES[0];
  });

  useEffect(() => {
    localStorage.setItem("map_style", currentMap.name);
  }, [currentMap]);

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

  // Получаем базовые координаты из хука
  const { center: hookCenter, zoom: hookZoom } = useMapPosition();

  // Инициализация сохраненного центра из localStorage с SSR проверкой для Next.js
  const [center, setCenter] = useState<[number, number]>(() => {
    if (typeof window !== "undefined") {
      const savedCenter = localStorage.getItem("map_center");
      if (savedCenter) return JSON.parse(savedCenter);
    }
    return hookCenter || [59.9343, 30.3344];
  });

  // Инициализация сохраненного зума из localStorage
  const [zoom, setZoom] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedZoom = localStorage.getItem("map_zoom");
      if (savedZoom) return parseInt(savedZoom, 10);
    }
    return hookZoom || 12;
  });

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
      <div className="absolute top-4 right-4 z-[1000] w-[180px] rounded-2xl bg-zinc-900/85 backdrop-blur-2xl border border-white/10 p-3 shadow-2xl flex flex-col gap-1">
        <span className="text-xs font-semibold text-zinc-400 px-1 mb-1">
          Стиль карты:
        </span>
        <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto pr-1">
          {MAP_STYLES.map((style) => (
            <button
              key={style.name}
              onClick={() => setCurrentMap(style)}
              className={`text-left text-xs px-3 py-2 rounded-xl transition-colors ${
                currentMap.name === style.name
                  ? "bg-white/10 text-white font-medium"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
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
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
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
            pane="overlayPane"
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
