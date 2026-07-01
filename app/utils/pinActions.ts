import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  FieldValue,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { PinType } from "@/app/types/pin";
import { useCreatePinStore } from "@/app/store/createPinStore";

type User = {
  id: string;
  name?: string;
  avatar?: string;
};

type Params = {
  user: User;
  pins: PinType[];
  editingPinId: string | null;
  selectedLat: number | null;
  selectedLng: number | null;
};

async function checkPinLimit(userId: string, pins: PinType[]) {
  const userPins = pins.filter((p) => p.user_id === userId);
  return userPins.length >= 10;
}

function buildLegacyMusicLinks(urls: string[]) {
  return urls.map((url) => {
    const lower = url.toLowerCase();
    let type: "youtube" | "spotify" | "yandex" = "youtube";

    if (lower.includes("spotify")) type = "spotify";
    else if (lower.includes("yandex")) type = "yandex";

    return { type, url };
  });
}

async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) throw new Error("ImgBB API key not found");

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!data.success) throw new Error("ImgBB upload failed");

  return data.data.url as string;
}

export async function savePin({
  user,
  pins,
  editingPinId,
  selectedLat,
  selectedLng,
}: Params) {
  const store = useCreatePinStore.getState();

  const {
    songTitle,
    artistName,
    story,
    placeName,
    links,
    selectedPinType,
    imageFile, // ← добавляем
    resetForm,
    setEditingPinId,
  } = store;

  if (!user) return;

  if (selectedLat === null || selectedLng === null) {
    alert("Select place on map");
    return;
  }

  if (!songTitle.trim() || !story.trim()) {
    alert("Fill required fields");
    return;
  }

  if (!editingPinId) {
    const limitReached = await checkPinLimit(user.id, pins);

    if (limitReached) {
      alert("Limit 10 pins reached");
      return;
    }
  }

  const cleanedLinks = links.filter((l) => l.trim() !== "");

  let imageUrl = "";

  if (imageFile) {
    try {
      imageUrl = await uploadImageToImgBB(imageFile);
    } catch (e) {
      console.error("Ошибка загрузки фото:", e);
      alert("Не удалось загрузить фото. Пин будет создан без него.");
    }
  }

  const rawData: Partial<PinType> = {
    user_id: user.id,
    pin_type: selectedPinType || undefined,
    user_name: user.name || "",
    user_avatar: user.avatar || "",
    song_title: songTitle,
    artist_name: artistName,
    story: story,
    place_name: placeName,
    links: cleanedLinks,
    music_links: buildLegacyMusicLinks(cleanedLinks),
    youtube_url: cleanedLinks.find((l) => l.includes("youtu")),
    spotify_url: cleanedLinks.find((l) => l.includes("spotify")),
    yandex_url: cleanedLinks.find((l) => l.includes("yandex")),
    latitude: selectedLat,
    longitude: selectedLng,
    image_url: imageUrl,
    likes_count: 0,
    liked_by_user: false,
    created_at: serverTimestamp() as unknown as FieldValue,
  };

  const pinData: Partial<PinType> = Object.fromEntries(
    Object.entries(rawData).filter(([_, v]) => v !== undefined),
  ) as Partial<PinType>;

  try {
    if (editingPinId) {
      delete pinData.created_at;

      await updateDoc(doc(db, "pins", editingPinId), pinData);
      alert("Pin updated!");
    } else {
      await addDoc(collection(db, "pins"), pinData);
      alert("Pin created!");
    }

    resetForm();
    setEditingPinId(null);
  } catch (e) {
    console.error(e);
    alert("Error saving pin");
  }
}
