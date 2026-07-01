import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { likePin, unlikePin } from "@/app/services/likeService";
import type { PinType } from "@/app/types/pin";
import { getUserLikes } from "@/app/services/likeService"; // Добавь эту строчку
import { usePinStore } from "@/app/store/pinStore";

export const handleToggleLike = async (
  pinId: string,
  liked: boolean,
  userId: string,
  pins: PinType[],
  selectedPin: PinType | null,
  setSelectedPin: (pin: PinType | null) => void,
) => {
  try {
    if (liked) {
      await unlikePin(userId, pinId);
      await updateDoc(doc(db, "pins", pinId), {
        likes_count: increment(-1),
      });
    } else {
      await likePin(userId, pinId);
      await updateDoc(doc(db, "pins", pinId), {
        likes_count: increment(1),
      });
    }

    const updatedPins = pins.map((pin) =>
      pin.id === pinId
        ? {
            ...pin,
            liked_by_user: !liked,
            likes_count: liked
              ? (pin.likes_count || 0) - 1
              : (pin.likes_count || 0) + 1,
          }
        : pin,
    );

    // ✔ обновляем Zustand напрямую
    usePinStore.getState().setPins(updatedPins);

    if (selectedPin?.id === pinId) {
      setSelectedPin({
        ...selectedPin,
        liked_by_user: !liked,
        likes_count: liked
          ? (selectedPin.likes_count || 0) - 1
          : (selectedPin.likes_count || 0) + 1,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }
};

export const fetchAndSyncLikes = async (userId: string, allPins: PinType[]) => {
  if (!userId || allPins.length === 0) return allPins;

  const likedPinIds = await getUserLikes(userId);
  return allPins.map((pin) => ({
    ...pin,
    liked_by_user: likedPinIds.includes(pin.id),
  }));
};
