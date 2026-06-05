"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ProfilePanel from "./components/profile/ProfilePanel";
import ProfileOverlay from "./components/overlays/ProfileOverlay";
import UserProfilePanel from "./components/profile/UserProfilePanel";
import { useCreatePinStore } from "@/app/store/createPinStore";
import { loadPins } from "@/app/services/pinsService";
import {
  createUserIfNotExists,
  getUserProfile,
} from "@/app/services/userService";

import { increment } from "firebase/firestore";

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

    youtubeUrl,
    setYoutubeUrl,

    spotifyUrl,
    setSpotifyUrl,

    yandexUrl,
    setYandexUrl,

    selectedLat,
    setSelectedLat,

    selectedLng,
    setSelectedLng,

    editingPinId,
    setEditingPinId,

    setIsCreatingPin,

    selectedPinType,
    setSelectedPinType,

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

  const [savedPins, setSavedPins] = useState<PinType[]>([]);

  const [isShowingSaved, setIsShowingSaved] = useState(false);

  const selectedPin = usePinStore((state) => state.selectedPin);

  const setSelectedPin = usePinStore((state) => state.setSelectedPin);

  const loadPinsData = async () => {
    try {
      const loadedPins = await loadPins();

      if (!user) {
        setPins(loadedPins);
        return;
      }

      const likedPinIds = await getUserLikes(user.id);

      console.log("LIKED PINS", likedPinIds);

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
  };

  const getLocation = () => {
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
  };

  const checkUser = () => {
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
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const [profile, setProfile] = useState<UserProfileType | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const unsubscribe = checkUser();

    loadPinsData();
    getLocation();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadPinsData();
    }
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleLike = async (pinId: string, liked: boolean) => {
    if (!user) return;

    console.log("TOGGLE", {
      pinId,
      liked,
    });

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

    try {
      const pinData = {
        user_id: user.id,

        pin_type: selectedPinType,

        user_name: user.name || "",

        user_avatar: user.avatar || "",

        song_title: songTitle,

        artist_name: artistName,

        story: story,

        place_name: placeName,

        youtube_url: youtubeUrl,

        spotify_url: spotifyUrl,

        yandex_url: yandexUrl,

        music_links: [
          ...(youtubeUrl
            ? [{ type: "youtube" as const, url: youtubeUrl }]
            : []),

          ...(spotifyUrl
            ? [{ type: "spotify" as const, url: spotifyUrl }]
            : []),

          ...(yandexUrl ? [{ type: "yandex" as const, url: yandexUrl }] : []),
        ],

        latitude: selectedLat,

        longitude: selectedLng,

        likes_count: 0,

        liked_by_user: false,

        created_at: Date.now(),
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
        // PROFILE PANEL
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
            // ДОБАВЬ ЭТУ СТРОКУ, ЕСЛИ ОНА СЛУЧАЙНО СТЕРЛАСЬ:
            onOpenUserProfile={(prof) => {
              setSelectedUserProfile(prof);
              setIsUserProfileOpen(true);
            }}
          />

          <button
            onClick={() => {
              setSelectedUserProfile({
                id: "fake_user_id_123",
                username: "daft_punk_fan",
                display_name: "Thomas Bangalter",
                bio: "Electronic music lover",
                status: "Listening to Homework 🎧",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Thomas", // генерирует забавную иконку робота
                created_at: Date.now(),
                pins_count: 12,
                likes_received: 42,
              });
              setIsUserProfileOpen(true);
            }}
            className="
    absolute
    top-80
    left-4
    z-[9999]
    bg-blue-500
    px-3
    py-2
    rounded-xl
  "
          >
            TEST USER PANEL
          </button>

          {isUserProfileOpen && (
            <UserProfilePanel
              profile={selectedUserProfile}
              currentUserId={user.id}
              onClose={() => setIsUserProfileOpen(false)}
            />
          )}

          <div className="h-full w-full">
            <div className="h-full w-full">
              <div
                className="
    absolute
    left-2
    bottom-24
    md:top-1/2
    md:bottom-auto
    md:-translate-y-1/2
    z-[4000]
    flex
    flex-row
    md:flex-col
    gap-2
  "
              >
                {[
                  { type: "music", icon: "🎵" },
                  { type: "concert", icon: "🎤" },
                  { type: "roadtrip", icon: "🚗" },
                  { type: "camping", icon: "⛺" },
                  { type: "night", icon: "🌙" },
                  { type: "summer", icon: "☀️" },
                  { type: "person", icon: "👤" },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() =>
                      setSelectedPinType(
                        selectedPinType === item.type ? null : item.type,
                      )
                    }
                    className={`
        w-11
        h-11
        rounded-full
        text-xl
        backdrop-blur-md
        transition-all
        duration-200
        ${
          selectedPinType === item.type
            ? "bg-white text-black scale-110"
            : "bg-black/45 text-white hover:bg-black/70"
        }
      `}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
              {isProfileOverlayOpen && user && (
                <ProfileOverlay
                  user={user}
                  profile={profile}
                  setProfile={setProfile}
                  onClose={() => setIsProfileOverlayOpen(false)}
                />
              )}
              <Map
                createPin={createPin}
                pins={pins.filter(
                  (pin) => pin.latitude !== null && pin.longitude !== null,
                )}
                toggleLike={toggleLike}
                currentUserId={user.id}
                onEditPin={(pin) => {
                  setEditingPinId(pin.id);

                  setSongTitle(pin.song_title || "");
                  setArtistName(pin.artist_name || "");
                  setStory(pin.story || "");
                  setPlaceName(pin.place_name || "");

                  setYoutubeUrl(pin.youtube_url || "");

                  setSpotifyUrl(pin.spotify_url || "");

                  setYandexUrl(pin.yandex_url || "");

                  setSelectedLat(pin.latitude);
                  setSelectedLng(pin.longitude);

                  setIsCreatingPin(true);
                }}
                onDeletePin={deletePin}
                onOpenUserProfile={async (userId) => {
                  const profileData = await getUserProfile(userId);

                  setSelectedUserProfile(profileData);

                  setIsUserProfileOpen(true);
                }}
              />

              <div
                className="
    absolute
    bottom-5
    left-1/2
    -translate-x-1/2
    z-[2500]
    text-xs
    text-white/40
    tracking-wide
    pointer-events-none
  "
              >
                tap map to create memory
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto pt-20">
          <div
            className="
            absolute
top-4
left-4
z-[9999]
            bg-black/45
            backdrop-blur-md
            border
            border-white/10
            rounded-2xl
            px-3
            py-2
            shadow-xl
          "
          >
            <h1 className="text-3xl font-bold mb-4">Music Map</h1>

            <button
              onClick={signInWithGoogle}
              className="
              w-full
              bg-white
              text-black
              p-3
              rounded-xl
              font-semibold
            "
            >
              Sign in with Google
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
