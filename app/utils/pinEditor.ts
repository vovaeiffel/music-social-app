import type { PinType } from "@/app/types/pin";
import { useCreatePinStore } from "@/app/store/createPinStore";

type Params = {
  pin: PinType;
};

export function startEditPin({ pin }: Params) {
  const store = useCreatePinStore.getState();

  // 1. очистка формы
  store.resetForm();

  // 2. режим редактирования
  store.setEditingPinId(pin.id);

  // 3. заполнение полей
  store.setSongTitle(pin.song_title || "");
  store.setArtistName(pin.artist_name || "");
  store.setStory(pin.story || "");
  store.setPlaceName(pin.place_name || "");

  // 4. ссылки (новые или старые)
  const legacyUrls = [pin.youtube_url, pin.spotify_url, pin.yandex_url].filter(
    Boolean,
  ) as string[];

  const actualLinks =
    pin.links && pin.links.length > 0 ? pin.links : legacyUrls;

  actualLinks.forEach((url, i) => {
    store.setLink(i, url);
  });

  // 5. координаты
  store.setSelectedLat(pin.latitude);
  store.setSelectedLng(pin.longitude);

  // 6. настройки
  const { setVisibility, setColor, setSelectedPinType } = store;

  setVisibility(pin.visibility || "global");
  setColor(pin.color || "#8B5CF6");
  setSelectedPinType(pin.pin_type || null);

  // 7. открыть форму
  store.setIsCreatingPin(true);
}
