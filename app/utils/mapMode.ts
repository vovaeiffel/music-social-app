import type { PinType } from "@/app/types/pin";
import type { UserProfileType } from "@/app/types/user";

export type MapMode = "global" | "personal" | "guest";

export function filterPinsForMap(
  pins: PinType[],
  mapMode: MapMode,
  currentUserId?: string,
  selectedUser?: UserProfileType | null,
) {
  return pins.filter((pin) => {
    if (pin.latitude == null || pin.longitude == null) {
      return false;
    }

    if (mapMode === "personal") {
      return pin.user_id === currentUserId;
    }

    if (mapMode === "guest") {
      return (
        pin.user_id === selectedUser?.id &&
        (pin.visibility === "global" || !pin.visibility)
      );
    }

    return pin.visibility === "global" || !pin.visibility;
  });
}
