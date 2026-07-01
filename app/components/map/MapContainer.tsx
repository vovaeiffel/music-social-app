"use client";

import dynamic from "next/dynamic";
import MapControls from "@/app/components/map/MapControls";
import type { PinType } from "@/app/types/pin";
import type { MapMode } from "@/app/utils/mapMode";

const Map = dynamic(() => import("../Map"), {
  ssr: false,
});

type Props = {
  pins: PinType[];
  createPin: () => void;
  toggleLike: (pinId: string, liked: boolean) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  onEditPin: (pin: PinType) => void;
  onDeletePin: (pinId: string) => void;
  onOpenUserProfile: (userId: string) => void;
  onPrepareNewPin: () => void;
  searchPos: [number, number] | null;
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
  setSearchPos: (pos: [number, number] | null) => void;
};

export default function MapContainer({
  pins,
  createPin,
  toggleLike,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onEditPin,
  onDeletePin,
  onOpenUserProfile,
  onPrepareNewPin,
  searchPos,
  mapMode,
  setMapMode,
  setSearchPos,
}: Props) {
  return (
    <div className="h-full w-full">
      <div className="h-full w-full">
        {/* Контейнер-обертка для управления, который лежит поверх всего */}
        <MapControls
          mapMode={mapMode}
          setMapMode={setMapMode}
          setSearchPos={setSearchPos}
        />

        <div className="absolute inset-0 z-0">
          <Map
            searchPos={searchPos}
            createPin={createPin}
            pins={pins}
            onPrepareNewPin={onPrepareNewPin}
            toggleLike={toggleLike}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            onEditPin={onEditPin}
            onDeletePin={onDeletePin}
            onOpenUserProfile={onOpenUserProfile}
          />
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-2500 text-xs text-white/40 tracking-wide pointer-events-none">
          tap map to create memory
        </div>
      </div>
    </div>
  );
}
