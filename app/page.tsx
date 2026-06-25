"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SearchBar from "./components/overlays/SearchBar";
import ProfilePanel from "./components/profile/ProfilePanel";
import ProfileOverlay from "./components/overlays/ProfileOverlay";
import UserProfilePanel from "./components/profile/UserProfilePanel";
import { useCreatePinStore } from "@/app/store/createPinStore";
import CreatePinOverlay from "./components/overlays/CreatePinOverlay";
import AppTips from "./components/AppTips";
import { subscribeToPins } from "@/app/services/pinsService";
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
import WelcomeScreen from "./components/WelcomeScreen";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  FieldValue,
  query,
  where,
  getDocs,
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

  const checkPinLimit = async (userId: string) => {
    const pinsRef = collection(db, "pins");
    // Делаем запрос: ищем все пины, где поле user_id совпадает с текущим пользователем
    const q = query(pinsRef, where("user_id", "==", userId));
    const querySnapshot = await getDocs(q);

    // Возвращает true, если пинов уже 10 или больше
    return querySnapshot.size >= 10;
  };

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

  // Эффект 1: Подписка на Firebase (запускается ТОЛЬКО ОДИН РАЗ при загрузке)
  useEffect(() => {
    const unsubscribeAuth = checkUser();

    // Эта часть должна обновлять список пинов автоматически при любом изменении в БД
    const unsubscribePins = subscribeToPins((newPins: PinType[]) => {
      setPins(newPins); // Обновляем состояние пинов для отображения
      usePinStore.getState().setPins(newPins); // Обновляем глобальный стор
    });

    getLocation();

    return () => {
      unsubscribeAuth();
      unsubscribePins();
    };
  }, []);

  // Эффект 2: Отдельно следим за пользователем, чтобы обновить лайки
  useEffect(() => {
    const updateLikes = async () => {
      const allPins = usePinStore.getState().pins; // Берем текущие пины из стора
      if (user?.id && allPins.length > 0) {
        const likedPinIds = await getUserLikes(user.id);
        const pinsWithLikes = allPins.map((pin) => ({
          ...pin,
          liked_by_user: likedPinIds.includes(pin.id),
        }));

        setPins(pinsWithLikes);
        setSavedPins(pinsWithLikes.filter((p) => p.liked_by_user));
        usePinStore.getState().setPins(pinsWithLikes);
      }
    };

    updateLikes();
  }, [user?.id]); // Зависим только от ID, чтобы не было циклов

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

      // 1. Обновляем список пинов, чтобы они исчезли с карты
      setPins((prev) => prev.filter((p) => p.id !== pinId));
      usePinStore.getState().setPins(pins.filter((p) => p.id !== pinId));

      // 2. ЗАКРЫВАЕМ ОКНО ПИНА, ЕСЛИ ОНО ОТКРЫТО
      if (selectedPin?.id === pinId) {
        setSelectedPin(null);
      }

      alert("Pin deleted!");
    } catch (error) {
      console.error(error);
      alert("Error deleting pin");
    }
  };

  const buildLegacyMusicLinks = (urls: string[]) => {
    return urls.map((url) => {
      const lower = url.toLowerCase();
      let type: "youtube" | "spotify" | "yandex" = "youtube";
      if (lower.includes("spotify") || lower.includes("open.spotify"))
        type = "spotify";
      else if (lower.includes("yandex") || lower.includes("music.yandex"))
        type = "yandex";
      return { type, url };
    });
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

    if (!editingPinId) {
      const isLimitReached = await checkPinLimit(user.id); // Используем user.id
      if (isLimitReached) {
        alert(
          "Вы достигли лимита в 10 пинов. Удалите старый, чтобы создать новый.",
        );
        return;
      }
    }

    const { visibility, color, imageFile } = useCreatePinStore.getState();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unused = visibility;
    const cleanedLinks = links.filter((link) => link.trim() !== "");

    try {
      let imageUrl = "";
      if (imageFile) {
        // ... (код загрузки ImgBB остается прежним)
      } else if (editingPinId) {
        imageUrl = pins.find((p) => p.id === editingPinId)?.image_url || "";
      }

      // Собираем объект, используя Partial, чтобы разрешить временные пропуски,
      // а затем удаляем undefined значения
      const rawData: Partial<PinType> = {
        user_id: user.id,
        pin_type: selectedPinType || undefined,
        color: color || "#8B5CF6",
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
        visibility: visibility,
        likes_count: 0,
        liked_by_user: false,
        created_at: serverTimestamp() as unknown as FieldValue,
      };

      // Убираем все поля со значением undefined перед отправкой
      const pinData = Object.fromEntries(
        Object.entries(rawData).filter(([key, value]) => value !== undefined),
      );

      if (editingPinId) {
        // При обновлении удаляем created_at, чтобы он не перезаписывался
        delete pinData.created_at;
        await updateDoc(
          doc(db, "pins", editingPinId),
          pinData as Record<string, unknown>,
        );
        alert("Pin updated!");
      } else {
        await addDoc(
          collection(db, "pins"),
          pinData as Record<string, unknown>,
        );
        alert("Pin created!");
      }

      resetForm();
    } catch (error) {
      console.error("Critical error in createPin:", error);
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

  console.log("Pins передаваемые в ProfileOverlay:", pins);

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

          <AppTips />

          {isUserProfileOpen && (
            <UserProfilePanel
              profile={selectedUserProfile}
              currentUserId={user.id}
              pins={pins}
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
              {isProfileOverlayOpen &&
                user &&
                (() => {
                  console.log(
                    "DEBUG: Попытка рендера ProfileOverlay. Массив пинов:",
                    pins,
                  );
                  return (
                    <ProfileOverlay
                      user={user}
                      profile={profile}
                      pins={pins}
                      myPinsCount={
                        pins.filter((p) => {
                          return (
                            String(p.user_id || "").trim() ===
                            String(user.id || "").trim()
                          );
                        }).length
                      }
                      setProfile={setProfile}
                      onClose={() => setIsProfileOverlayOpen(false)}
                    />
                  );
                })()}

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
                  currentUserName={user.name || ""}
                  currentUserAvatar={user.avatar || ""}
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
        <WelcomeScreen onGoogleLogin={signInWithGoogle} />
      )}
    </main>
  );
}
