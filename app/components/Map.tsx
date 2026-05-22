"use client";

import { customIcon, activeIcon } from "./CustomMarker";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type PinType = {
  id: string;

  user_id: string;

  song_title: string;
  artist_name: string;
  story: string;
  place_name: string;

  latitude: number;
  longitude: number;

  user_name?: string;
  user_avatar?: string;

  youtube_url?: string;
  spotify_url?: string;
  yandex_url?: string;

  likes_count?: number;
  liked_by_user?: boolean;
};

type Props = {
  pins: PinType[];

  setSelectedPinType: (type: string | null) => void;

  toggleLike: (pinId: string, liked: boolean) => void;

  selectedPinType: string | null;

  selectedPin: PinType | null;

  setSelectedPin: (pin: PinType | null) => void;

  currentUserId?: string;

  onEditPin: (pin: PinType) => void;

  onDeletePin: (pinId: string) => void;

  selectedLat: number | null;
  selectedLng: number | null;

  setSelectedLat: (lat: number) => void;

  setSelectedLng: (lng: number) => void;

  setIsCreatingPin: (value: boolean) => void;
};

function MapClickHandler({
  setSelectedPin,
  setSelectedLat,
  setSelectedLng,
  setIsCreatingPin,
  selectedPinType,
}: {
  setSelectedLat: (lat: number) => void;

  setSelectedLng: (lng: number) => void;

  setIsCreatingPin: (value: boolean) => void;

  selectedPinType: string | null;

  setSelectedPin: (pin: PinType | null) => void;
}) {
  useMapEvents({
    click(e) {
      if (!selectedPinType) return;
      setSelectedPin(null);

      setSelectedLat(e.latlng.lat);
      setSelectedLng(e.latlng.lng);

      setIsCreatingPin(true);
    },
  });

  return null;
}

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}

function SaveMapPosition() {
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

function FlyToPin({ pin }: { pin: PinType | null }) {
  const map = useMap();

  useEffect(() => {
    if (!pin) return;

    map.flyTo([pin.latitude, pin.longitude], 15, {
      duration: 0.6,
    });
  }, [pin, map]);

  return null;
}

function SelectedPinOverlay({
  pin,
  onClose,
  toggleLike,
  currentUserId,
  onEditPin,
  onDeletePin,
}: {
  pin: PinType | null;

  onClose: () => void;

  toggleLike: (pinId: string, liked: boolean) => void;

  currentUserId?: string;

  onEditPin: (pin: PinType) => void;

  onDeletePin: (pinId: string) => void;
}) {
  const map = useMap();

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (!pin) return;

    function updatePosition() {
      const point = map.latLngToContainerPoint([pin!.latitude, pin!.longitude]);

      setPosition({
        x: point.x,
        y: point.y,
      });
      const zoom = map.getZoom();

      /*
        3   -> 0.45
        6   -> 0.65
        10  -> 1
        15  -> 1.45
      */

      const scale = 0.25 + zoom * 0.08;

      setZoomScale(scale);
    }

    updatePosition();

    map.on("move", updatePosition);
    map.on("zoom", updatePosition);

    return () => {
      map.off("move", updatePosition);

      map.off("zoom", updatePosition);
    };
  }, [pin, map]);

  if (!pin) return null;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: zoomScale * 0.85,
        y: 20,
      }}
      animate={{
        opacity: 1,
        scale: zoomScale,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: zoomScale * 0.9,
        y: 10,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="
    absolute
    z-[2000]
    pointer-events-none
  "
      style={{
        left: position.x - 110,
        top: position.y - 170,
      }}
    >
      <div
        ref={(el) => {
          if (!el) return;

          L.DomEvent.disableClickPropagation(el);
          L.DomEvent.disableScrollPropagation(el);
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        className="
        w-[230px]
        max-w-[70vw]
        rounded-2xl
        bg-black/70
        backdrop-blur-2xl
        border
        border-white/10
        shadow-2xl
        p-3
        text-white
        pointer-events-auto
      "
      >
        <div
          className="
            flex
            justify-between
            items-start
            mb-3
          "
        >
          <div className="flex items-center gap-2 mb-3">
            {pin.user_avatar && (
              <img
                src={pin.user_avatar}
                alt="avatar"
                className="w-7 h-7 rounded-full"
              />
            )}

            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {pin.user_name || "Unknown"}
              </p>

              <p className="text-[11px] text-white/40">music memory</p>
            </div>
          </div>

          <div>
            <h2
              className="
               text-base
font-semibold
              "
            >
              {pin.song_title}
            </h2>

            <p
              className="
                text-zinc-400
              "
            >
              {pin.artist_name}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();

              onClose();
            }}
            className="
              text-white/50 text-sm
              hover:text-white
            "
          >
            ×
          </button>
        </div>

        <p
          className="
            text-[13px]
leading-relaxed
text-white/80
mb-4
          "
        >
          {pin.story}
        </p>

        {pin.youtube_url && (
          <iframe
            width="100%"
            height="160"
            src={pin.youtube_url?.replace("watch?v=", "embed/")}
            title="YouTube player"
            allowFullScreen
            className="rounded-xl"
          />
        )}

        {pin.spotify_url && (
          <div className="mt-3 w-full overflow-hidden rounded-xl">
            <div className="origin-top-left scale-[0.88]">
              <iframe
                src={pin.spotify_url.replace(
                  "open.spotify.com/track/",
                  "open.spotify.com/embed/track/",
                )}
                width="114%"
                height="110"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="block border-0"
              />
            </div>
          </div>
        )}

        {pin.yandex_url && (
          <a
            href={pin.yandex_url}
            target="_blank"
            rel="noopener noreferrer"
            className="
      mt-3
      flex
      items-center
      justify-center
      rounded-xl
      bg-red-500/90
      hover:bg-red-500
      transition
      py-2
      text-sm
      font-medium
    "
          >
            Open in Yandex Music
          </a>
        )}

        <div
          className="
    flex
    items-center
    justify-between
    mt-4
  "
        >
          <button
            onClick={(e) => {
              e.stopPropagation();

              toggleLike(pin.id, pin.liked_by_user || false);
            }}
            className="
      text-sm
      hover:scale-105
      transition
    "
          >
            {pin.liked_by_user ? "❤️" : "🤍"} {pin.likes_count || 0}
          </button>

          {currentUserId === pin.user_id && (
            <div className="flex gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  onEditPin(pin);
                }}
                className="
          text-sm
          text-blue-400
          hover:text-blue-300
        "
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();

                  onDeletePin(pin.id);
                }}
                className="
          text-sm
          text-red-400
          hover:text-red-300
        "
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Map({
  pins,
  toggleLike,
  selectedPin,
  setSelectedPin,
  currentUserId,
  onEditPin,
  onDeletePin,
  selectedPinType,
  setSelectedPinType,
  selectedLat,
  selectedLng,
  setSelectedLat,
  setSelectedLng,
  setIsCreatingPin,
}: Props) {
  console.log("PINS:", pins);
  console.log("SELECTED:", selectedLat, selectedLng);
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
      className="rounded-2xl overflow-hidden"
    >
      <MapContainer
        center={
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("map-position") || "null")
              ? [
                  JSON.parse(localStorage.getItem("map-position")!).lat,

                  JSON.parse(localStorage.getItem("map-position")!).lng,
                ]
              : [51.505, -0.09]
            : [51.505, -0.09]
        }
        zoom={
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("map-position") || "null")
                ?.zoom || 2
            : 2
        }
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
        <SelectedPinOverlay
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          toggleLike={toggleLike}
          currentUserId={currentUserId}
          onEditPin={onEditPin}
          onDeletePin={onDeletePin}
        />
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
        />

        {selectedLat !== null && selectedLng !== null && (
          <Marker position={[selectedLat, selectedLng]}>
            <Popup>
              <div className="text-black">New pin position</div>
            </Popup>
          </Marker>
        )}

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={selectedPin?.id === pin.id ? activeIcon : customIcon}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e.originalEvent);

                setSelectedPin(pin);
              },
            }}
          ></Marker>
        ))}
      </MapContainer>
    </div>
  );
}
