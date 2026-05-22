"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { auth, provider, db } from "@/lib/firebase";

import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
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

type PinType = {
  id: string;

  user_id: string;

  pin_type?: string;

  song_title: string;
  artist_name: string;
  story: string;
  place_name: string;

  latitude: number;
  longitude: number;

  user_name?: string;
  user_avatar?: string;

  youtube_url?: string;
  spotify_url?: string;
  yandex_url?: string;

  likes_count?: number;
  liked_by_user?: boolean;
};

export default function Home() {
  const [user, setUser] = useState<UserType | null>(null);

  const [loading, setLoading] = useState(true);

  const [pins, setPins] = useState<PinType[]>([]);

  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [story, setStory] = useState("");
  const [placeName, setPlaceName] = useState("");

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [yandexUrl, setYandexUrl] = useState("");

  const [selectedLat, setSelectedLat] = useState<number | null>(null);

  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  const [editingPinId, setEditingPinId] = useState<string | null>(null);

  const [isCreatingPin, setIsCreatingPin] = useState(false);

  const [selectedPin, setSelectedPin] = useState<PinType | null>(null);

  const [selectedPinType, setSelectedPinType] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    loadPins();
    getLocation();
  }, []);

  async function getLocation() {
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
  }

  function checkUser() {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          avatar: firebaseUser.photoURL || "",
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });
  }

  async function signInWithGoogle() {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadPins() {
    try {
      const querySnapshot = await getDocs(collection(db, "pins"));

      const loadedPins: PinType[] = [];

      querySnapshot.forEach((document) => {
        loadedPins.push({
          id: document.id,
          ...(document.data() as Omit<PinType, "id">),
        });
      });

      setPins(loadedPins);
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleLike(pinId: string, liked: boolean) {
    const updatedPins = pins.map((pin) => {
      if (pin.id !== pinId) return pin;

      return {
        ...pin,
        liked_by_user: !liked,
        likes_count: liked
          ? (pin.likes_count || 1) - 1
          : (pin.likes_count || 0) + 1,
      };
    });

    setPins(updatedPins);

    if (selectedPin?.id === pinId) {
      setSelectedPin({
        ...selectedPin,
        liked_by_user: !liked,
        likes_count: liked
          ? (selectedPin.likes_count || 1) - 1
          : (selectedPin.likes_count || 0) + 1,
      });
    }
  }

  async function deletePin(pinId: string) {
    try {
      await deleteDoc(doc(db, "pins", pinId));

      await loadPins();

      setSelectedPin(null);
    } catch (error) {
      console.error(error);

      alert("Error deleting pin");
    }
  }

  async function createPin() {
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

      await loadPins();

      setSongTitle("");
      setArtistName("");
      setStory("");
      setPlaceName("");

      setYoutubeUrl("");
      setSpotifyUrl("");
      setYandexUrl("");

      setSelectedLat(null);
      setSelectedLng(null);

      setEditingPinId(null);

      setIsCreatingPin(false);
    } catch (error) {
      console.error(error);

      alert("Error creating pin");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-black text-white">
      {!user ? (
        <div className="max-w-md mx-auto pt-20">
          <div
            className="
    absolute
    top-4
    left-4
    z-[3000]
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
            <h1 className="text-3xl font-bold">Music Map</h1>

            <button
              onClick={signInWithGoogle}
              className="w-full bg-white text-black p-3 rounded-xl font-semibold"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      ) : (
        <div className="relative h-full w-full">
          <div>
            <div
              className="
    absolute
    top-4
    left-4
    z-[3000]
    w-[260px]
    max-w-[calc(100vw-32px)]
    rounded-xl
    bg-zinc-900/85
    backdrop-blur-xl
    p-3
    shadow-2xl
  "
            >
              <div className="flex items-center gap-3">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                )}

                <div className="flex-1">
                  <p className="font-semibold">{user.name || user.email}</p>
                </div>

                <button
                  onClick={() => signOut(auth)}
                  className="
    text-xs
    text-zinc-400
    hover:text-white
    transition
  "
                >
                  logout
                </button>
              </div>
            </div>
          </div>

          <div className="h-full w-full">
            <div className="h-full w-full">
              <div
                className="
    absolute
    left-3
    top-1/2
    -translate-y-1/2
    z-[4000]
    flex
    flex-col
    gap-2
    rounded-2xl
    bg-black/55
    backdrop-blur-xl
    border
    border-white/10
    p-2
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
        rounded-xl
        text-xl
        transition-all
        ${
          selectedPinType === item.type
            ? "bg-white text-black scale-110"
            : "bg-zinc-800/80"
        }
      `}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
              <Map
                pins={pins.filter(
                  (pin) => pin.latitude !== null && pin.longitude !== null,
                )}
                toggleLike={toggleLike}
                selectedPinType={selectedPinType}
                setSelectedPinType={setSelectedPinType}
                selectedPin={selectedPin}
                setSelectedPin={setSelectedPin}
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
                selectedLat={selectedLat}
                selectedLng={selectedLng}
                setSelectedLat={setSelectedLat}
                setSelectedLng={setSelectedLng}
                setIsCreatingPin={setIsCreatingPin}
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

              {isCreatingPin && (
                <div
                  className="
                    absolute
                    top-3
                    left-4
                    z-[1000]
                    w-full
                    max-w-sm
                    bg-zinc-900/95
                    backdrop-blur
                    rounded-2xl
                    p-4
                    shadow-2xl
                    space-y-3
                    max-h-[95%]
                    overflow-y-auto
                  "
                >
                  <h2 className="text-xl font-bold">
                    {editingPinId ? "Edit Pin" : "Create Pin"}
                  </h2>

                  <input
                    type="text"
                    placeholder="Song title"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800"
                  />

                  <input
                    type="text"
                    placeholder="Artist"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800"
                  />

                  <textarea
                    placeholder="Your story"
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800 h-20"
                  />

                  <input
                    type="text"
                    placeholder="Place"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800"
                  />

                  <input
                    type="text"
                    placeholder="YouTube link"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800"
                  />

                  <input
                    type="text"
                    placeholder="Spotify link"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800"
                  />

                  <input
                    type="text"
                    placeholder="Yandex Music link"
                    value={yandexUrl}
                    onChange={(e) => setYandexUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={createPin}
                      className="
                        flex-1
                        bg-white
                        text-black
                        p-3
                        rounded-xl
                        font-semibold
                      "
                    >
                      {editingPinId ? "Save" : "Create"}
                    </button>

                    <button
                      onClick={() => {
                        setIsCreatingPin(false);

                        setEditingPinId(null);

                        setSelectedLat(null);
                        setSelectedLng(null);
                      }}
                      className="
                        px-4
                        rounded-xl
                        bg-zinc-700
                      "
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
