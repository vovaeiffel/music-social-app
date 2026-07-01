"use client";

import { useCallback, useEffect, useState } from "react";
import { useCreatePinStore } from "@/app/store/createPinStore";
import { usePinStore } from "@/app/store/pinStore";
import { subscribeToPins } from "@/app/services/pinsService";
import { handleToggleLike, fetchAndSyncLikes } from "@/app/utils/likeActions";
import { savePin } from "@/app/utils/pinActions";
import type { PinType } from "@/app/types/pin";

export function usePinsSync(userId?: string) {
  const {
    setSelectedLat,
    setSelectedLng,
    selectedLat,
    selectedLng,
    editingPinId,
  } = useCreatePinStore();

  const pins = usePinStore((state) => state.pins);
  const setPins = usePinStore((state) => state.setPins);
  const selectedPin = usePinStore((state) => state.selectedPin);
  const setSelectedPin = usePinStore((state) => state.setSelectedPin);

  const [savedPins, setSavedPins] = useState<PinType[]>([]);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLat(position.coords.latitude);
        setSelectedLng(position.coords.longitude);
      },
      (error) => {
        console.error(error);
      },
    );
  }, [setSelectedLat, setSelectedLng]);

  useEffect(() => {
    const unsubscribePins = subscribeToPins((newPins: PinType[]) => {
      setPins(newPins);
    });

    getLocation();

    return () => unsubscribePins();
  }, [getLocation, setPins]);

  useEffect(() => {
    const syncLikes = async () => {
      if (!userId) return;
      const pinsWithLikes = await fetchAndSyncLikes(userId, pins);
      setPins(pinsWithLikes);
      setSavedPins(pinsWithLikes.filter((p) => p.liked_by_user));
    };
    syncLikes();
  }, [userId]);

  const myPinsCount = pins.filter(
    (p) => String(p.user_id || "").trim() === String(userId || "").trim(),
  ).length;

  const toggleLike = useCallback(
    async (pinId: string, liked: boolean) => {
      if (!userId) return;
      await handleToggleLike(
        pinId,
        liked,
        userId,
        pins,
        selectedPin,
        setSelectedPin,
      );
    },
    [userId, pins, selectedPin, setSelectedPin],
  );

  const createPin = useCallback(
    async (user: {
      id: string;
      email?: string;
      name?: string;
      avatar?: string;
    }) => {
      await savePin({
        user,
        pins,
        editingPinId,
        selectedLat,
        selectedLng,
      });
    },
    [pins, editingPinId, selectedLat, selectedLng],
  );

  return { pins, savedPins, myPinsCount, toggleLike, createPin };
}
