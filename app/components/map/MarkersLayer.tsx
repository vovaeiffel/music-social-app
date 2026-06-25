"use client";

import { usePinStore } from "@/app/store/pinStore";

import { memo } from "react";

import { Marker } from "react-leaflet";
import L from "leaflet";

import type { PinType } from "@/app/types/pin";

import { getPinIcon, getActivePinIcon } from "../CustomMarker";

type Props = {
  pins: PinType[];
};

function MarkersLayer({ pins }: Props) {
  const selectedPin = usePinStore((state) => state.selectedPin);

  const setSelectedPin = usePinStore((state) => state.setSelectedPin);
  return (
    <>
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.latitude, pin.longitude]}
          icon={
            selectedPin?.id === pin.id
              ? getActivePinIcon(pin.pin_type, pin.visibility, pin.color)
              : getPinIcon(pin.pin_type, pin.visibility, pin.color)
          }
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e.originalEvent);

              setSelectedPin(pin);
            },
          }}
        />
      ))}
    </>
  );
}

export default memo(MarkersLayer);
