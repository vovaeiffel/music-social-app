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
    <main className="min-h-screen bg-black text-white p-4 md:p-6">
      {!user ? (
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-zinc-900 p-8 rounded-2xl space-y-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="bg-zinc-900 rounded-2xl p-6 h-full">
              <h2 className="text-2xl font-bold mb-4">Music Map</h2>

              <div className="flex items-center gap-3 mb-6">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                )}

                <div className="flex-1">
                  <p className="font-semibold">{user.name || user.email}</p>

                  <p className="text-xs text-zinc-400">Logged in</p>
                </div>

                <button
                  onClick={() => signOut(auth)}
                  className="text-sm bg-zinc-800 px-3 py-2 rounded-xl"
                >
                  Logout
                </button>
              </div>

              <div className="text-zinc-400 space-y-3">
                <p>Click anywhere on the map to create a music memory.</p>

                <p>Select pins to explore stories from other people.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div
              className="
                relative
                h-[68vh]
                min-h-[630px]
                rounded-2xl
                overflow-hidden
              "
            >
              <Map
                pins={pins.filter(
                  (pin) => pin.latitude !== null && pin.longitude !== null,
                )}
                toggleLike={toggleLike}
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
