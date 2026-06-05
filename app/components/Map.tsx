"use client";

import { getPinIcon } from "./CustomMarker";
import { useCreatePinStore } from "@/app/store/createPinStore";

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

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { useCallback } from "react";

type Props = {
  pins: PinType[];

  createPin: () => void;

  toggleLike: (pinId: string, liked: boolean) => void;

  currentUserId?: string;

  onEditPin: (pin: PinType) => void;

  onDeletePin: (pinId: string) => void;

  onOpenUserProfile: (userId: string) => void;
};

export default function Map({
  pins,
  createPin,
  toggleLike,
  currentUserId,
  onEditPin,
  onDeletePin,
  onOpenUserProfile,
}: Props) {
  const {
    songTitle,
    setSongTitle,

    artistName,
    setArtistName,

    story,
    setStory,

    selectedPinType,
    setSelectedPinType,

    selectedLat,
    setSelectedLat,

    selectedLng,
    setSelectedLng,

    isCreatingPin,
    setIsCreatingPin,
  } = useCreatePinStore();
  const selectedPin = usePinStore((state) => state.selectedPin);

  const setSelectedPin = usePinStore((state) => state.setSelectedPin);
  const { center, zoom } = useMapPosition();
  const handleCloseSelectedPin = useCallback(() => {
    setSelectedPin(null);
  }, [setSelectedPin]);
  const handleCloseCreatePin = useCallback(() => {
    setIsCreatingPin(false);
  }, [setIsCreatingPin]);
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
        <SaveMapPosition />
        <FlyToPin pin={selectedPin} />
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
        {isCreatingPin && selectedLat !== null && selectedLng !== null && (
          <CreatePinOverlay
            lat={selectedLat}
            lng={selectedLng}
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
