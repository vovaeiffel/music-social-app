"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SearchBar from "./components/overlays/SearchBar";
import ProfilePanel from "./components/profile/ProfilePanel";
import ProfileOverlay from "./components/overlays/ProfileOverlay";
import UserProfilePanel from "./components/profile/UserProfilePanel";
import { useCreatePinStore } from "@/app/store/createPinStore";
import CreatePinOverlay from "./components/overlays/CreatePinOverlay";
import { loadPins } from "@/app/services/pinsService";
import {
  createUserIfNotExists,
  getUserProfile,
} from "@/app/services/userService";

import { increment } from "firebase/firestore";
import { Globe, Music } from "lucide-react";
import { likePin, unlikePin, getUserLikes } from "@/app/services/likeService";
import type { UserProfileType } from "@/app/types/user";
import type { PinType } from "@/app/types/pin";
import { usePinStore } from "@/app/store/pinStore";
import { auth, provider, db } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
});

type UserType = {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
};

export default function Home() {
  const {
    songTitle,
    setSongTitle,
    artistName,
    setArtistName,
    story,
    setStory,
    placeName,
    setPlaceName,
    links,
    setLink,
    selectedLat,
    setSelectedLat,
    selectedLng,
    setSelectedLng,
    editingPinId,
    setEditingPinId,
    isCreatingPin,
    setIsCreatingPin,
    selectedPinType,
    resetForm,
  } = useCreatePinStore();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] =
    useState<UserProfileType | null>(null);
  const [pins, setPins] = useState<PinType[]>([]);
  const [searchPos, setSearchPos] = useState<[number, number] | null>(null);
  const [savedPins, setSavedPins] = useState<PinType[]>([]);
  const [isShowingSaved, setIsShowingSaved] = useState(false);

  const selectedPin = usePinStore((state) => state.selectedPin);
  const setSelectedPin = usePinStore((state) => state.setSelectedPin);

  const handleStartNewPin = () => {
    resetForm(); // Это очистит все поля: songTitle, artistName, links, story и т.д.
    setIsCreatingPin(true); // А это откроет форму
  };

  const [mapMode, setMapMode] = useState<"global" | "personal" | "guest">(
    "global",
  );
  const [profile, setProfile] = useState<UserProfileType | null>(null);

  // Обернули функции в useCallback, чтобы избежать лишних рендеров и ошибок линтера
  const loadPinsData = useCallback(async () => {
    try {
      const loadedPins = await loadPins();

      if (!user) {
        setPins(loadedPins);
        return;
      }

      const likedPinIds = await getUserLikes(user.id);
      const pinsWithLikes = loadedPins.map((pin) => ({
        ...pin,
        liked_by_user: likedPinIds.includes(pin.id),
      }));

      const saved = pinsWithLikes.filter((pin) => pin.liked_by_user);
      setSavedPins(saved);
      setPins(pinsWithLikes);
    } catch (error) {
      console.error(error);
    }
  }, [user]);

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

  const checkUser = useCallback(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await createUserIfNotExists({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "",
          avatar: firebaseUser.photoURL || "",
        });

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          avatar: firebaseUser.photoURL || "",
        });

        const profileData = await getUserProfile(firebaseUser.uid);
        setProfile(profileData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  // Эффект полной инициализации при монтировании компонента
  useEffect(() => {
    const unsubscribe = checkUser();

    const initData = async () => {
      await loadPinsData();
      getLocation();
    };

    initData();

    return () => unsubscribe();
    // Убираем лишние зависимости, оставляя только те, которые реально инициализируют приложение
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Этот эффект мы убираем совсем или переписываем строго на смену ID пользователя,
  // чтобы он не реагировал на обновление самой функции loadPinsData
  useEffect(() => {
    if (user?.id) {
      const refreshPins = async () => {
        await loadPinsData();
      };
      refreshPins();
    }
    // Следим ТОЛЬКО за изменением ID пользователя, а не за инстансом функции
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const toggleLike = async (pinId: string, liked: boolean) => {
    if (!user) return;
    try {
      if (liked) {
        await unlikePin(user.id, pinId);
        await updateDoc(doc(db, "pins", pinId), {
          likes_count: increment(-1),
        });
      } else {
        await likePin(user.id, pinId);
        await updateDoc(doc(db, "pins", pinId), {
          likes_count: increment(1),
        });
      }

      const updatedPins = pins.map((pin) => {
        if (pin.id !== pinId) return pin;
        return {
          ...pin,
          liked_by_user: !liked,
          likes_count: liked
            ? (pin.likes_count || 0) - 1
            : (pin.likes_count || 0) + 1,
        };
      });

      setPins(updatedPins);

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
      console.error(error);
    }
  };

  const deletePin = async (pinId: string) => {
    try {
      await deleteDoc(doc(db, "pins", pinId));
      await loadPinsData();
    } catch (error) {
      console.error(error);
      alert("Error deleting pin");
    }
  };

  const createPin = async () => {
    if (!user) return;

    if (selectedLat === null || selectedLng === null) {
      alert("Select place on map");
      return;
    }

    if (!songTitle.trim() || !story.trim()) {
      alert("Fill required fields");
      return;
    }

    const { visibility, color, imageFile } = useCreatePinStore.getState();
    const cleanedLinks = links.filter((link) => link.trim() !== "");

    const buildLegacyMusicLinks = (urls: string[]) => {
      return urls.map((url) => {
        const lower = url.toLowerCase();
        let type: "youtube" | "spotify" | "yandex" = "youtube";
        if (lower.includes("spotify") || lower.includes("open.spotify"))
          type = "spotify";
        if (lower.includes("yandex") || lower.includes("music.yandex"))
          type = "yandex";
        return { type, url };
      });
    };

    try {
      let imageUrl = "";

      // Загрузка фото через API ImgBB
      if (imageFile) {
        const IMGBB_API_KEY = "bd4cb85df9af68361f0a0d7e2f15e5d2"; // <-- Вставьте сюда ваш ключ

        const formData = new FormData();
        formData.append("image", imageFile);

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to upload image to ImgBB");
        }

        const data = await response.json();
        imageUrl = data.data.url; // Получаем прямую ссылку на картинку
      } else if (editingPinId) {
        imageUrl = pins.find((p) => p.id === editingPinId)?.image_url || "";
      }

      const pinData = {
        user_id: user.id,
        pin_type: selectedPinType,
        color: color,
        user_name: user.name || "",
        user_avatar: user.avatar || "",
        song_title: songTitle,
        artist_name: artistName,
        story: story,
        place_name: placeName,
        links: cleanedLinks,
        music_links: buildLegacyMusicLinks(cleanedLinks),
        youtube_url: cleanedLinks.find((l) => l.includes("youtu")) || "",
        spotify_url: cleanedLinks.find((l) => l.includes("spotify")) || "",
        yandex_url: cleanedLinks.find((l) => l.includes("yandex")) || "",
        latitude: selectedLat,
        longitude: selectedLng,
        image_url: imageUrl,
        likes_count: editingPinId
          ? pins.find((p) => p.id === editingPinId)?.likes_count || 0
          : 0,
        liked_by_user: editingPinId
          ? pins.find((p) => p.id === editingPinId)?.liked_by_user || false
          : false,
        created_at: Date.now(),
        visibility: visibility,
      };

      if (editingPinId) {
        await updateDoc(doc(db, "pins", editingPinId), pinData);
        alert("Pin updated!");
      } else {
        await addDoc(collection(db, "pins"), pinData);
        alert("Pin created!");
      }

      await loadPinsData();
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Error creating pin");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-black text-white">
      {user ? (
        <div className="relative h-full w-full">
          <ProfilePanel
            savedPins={savedPins}
            isShowingSaved={isShowingSaved}
            setIsShowingSaved={setIsShowingSaved}
            profile={profile}
            user={user}
            pins={pins}
            setSelectedPin={setSelectedPin}
            onLogout={() => signOut(auth)}
            onOpenSettings={() => setIsProfileOverlayOpen(true)}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            openProfileOverlay={() => setIsProfileOverlayOpen(true)}
            onOpenUserProfile={(prof) => {
              setSelectedUserProfile(prof);
              setIsUserProfileOpen(true);
              setMapMode("guest");
            }}
          />

          {/* Вертикальный логотип MelMi на всю высоту левого края со светлой подсветкой */}
          <div className="absolute left-4 top-[180px] bottom-8 z-20 hidden md:flex flex-col items-center pointer-events-none bg-white/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
            <img
              src="/melmi-vertical.png"
              alt="MelMi Vertical Logo"
              className="w-auto h-full object-contain opacity-90"
            />
          </div>

          {isUserProfileOpen && (
            <UserProfilePanel
              profile={selectedUserProfile}
              currentUserId={user.id}
              onClose={() => {
                setIsUserProfileOpen(false);
                setMapMode("global");
              }}
              onVisitMap={() => {
                setMapMode("guest");
              }}
            />
          )}

          <div className="h-full w-full">
            <div className="h-full w-full">
              {isProfileOverlayOpen && user && (
                <ProfileOverlay
                  user={user}
                  profile={profile}
                  setProfile={setProfile}
                  onClose={() => setIsProfileOverlayOpen(false)}
                />
              )}

              {/* Контейнер-обертка для управления, который лежит поверх всего */}
              <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-2000 flex flex-col md:flex-row items-center gap-3">
                {/* 1. Поиск */}
                <div className="w-[300px]">
                  <SearchBar
                    onSelectLocation={(lat: number, lng: number) =>
                      setSearchPos([lat, lng])
                    }
                  />
                </div>

                {/* 2. Кнопки переключения режима карты */}
                <div className="flex bg-zinc-900/85 backdrop-blur-2xl p-1 rounded-2xl border border-white/10 shadow-2xl gap-1">
                  <button
                    onClick={() => setMapMode("global")}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                      mapMode === "global"
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Globe
                      size={16}
                      strokeWidth={mapMode === "global" ? 2.5 : 2}
                    />
                    <span>Global Map</span>
                  </button>
                  <button
                    onClick={() => setMapMode("personal")}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                      mapMode === "personal"
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Music
                      size={16}
                      strokeWidth={mapMode === "personal" ? 2.5 : 2}
                    />
                    <span>My Map</span>
                  </button>
                </div>
              </div>

              <div className="absolute inset-0 z-0">
                <Map
                  searchPos={searchPos}
                  createPin={createPin}
                  pins={pins.filter((pin) => {
                    if (pin.latitude === null || pin.longitude === null)
                      return false;

                    if (mapMode === "personal") {
                      return pin.user_id === user.id;
                    }

                    if (mapMode === "guest") {
                      return (
                        pin.user_id === selectedUserProfile?.id &&
                        (pin.visibility === "global" || !pin.visibility)
                      );
                    }

                    return pin.visibility === "global" || !pin.visibility;
                  })}
                  onPrepareNewPin={handleStartNewPin}
                  toggleLike={toggleLike}
                  currentUserId={user.id}
                  onEditPin={(pin) => {
                    console.log("Редактирование пина с ID:", pin.id);

                    // 1. Сначала сбрасываем всё в начальное состояние
                    resetForm();

                    // 2. Устанавливаем ID редактирования
                    setEditingPinId(pin.id);

                    // 3. Заполняем данные из пина
                    setSongTitle(pin.song_title || "");
                    setArtistName(pin.artist_name || "");
                    setStory(pin.story || "");
                    setPlaceName(pin.place_name || "");

                    // 4. Обработка ссылок
                    const extendedPin = pin as PinType & { links?: string[] };
                    const legacyUrls = [
                      pin.youtube_url,
                      pin.spotify_url,
                      pin.yandex_url,
                    ].filter(Boolean) as string[];
                    const actualLinks =
                      extendedPin.links && extendedPin.links.length > 0
                        ? extendedPin.links
                        : legacyUrls;

                    actualLinks.forEach((url: string, i: number) => {
                      setLink(i, url);
                    });

                    // 5. Координаты и настройки
                    setSelectedLat(pin.latitude);
                    setSelectedLng(pin.longitude);

                    const { setVisibility, setColor, setSelectedPinType } =
                      useCreatePinStore.getState();
                    setVisibility(pin.visibility || "global");
                    setColor(pin.color || "#8B5CF6");
                    setSelectedPinType(pin.pin_type || null);

                    // 6. Финальное открытие формы
                    setIsCreatingPin(true);
                  }}
                  onDeletePin={deletePin}
                  onOpenUserProfile={async (userId) => {
                    const profileData = await getUserProfile(userId);
                    setSelectedUserProfile(profileData);
                    setIsUserProfileOpen(true);
                  }}
                />
              </div>

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-2500 text-xs text-white/40 tracking-wide pointer-events-none">
                tap map to create memory
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto pt-20">
          <div className="absolute top-4 left-4 z-9999 bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 shadow-xl">
            <h1 className="text-3xl font-bold mb-4">Music Map</h1>
            <button
              onClick={signInWithGoogle}
              className="w-full bg-white text-black p-3 rounded-xl font-semibold"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
