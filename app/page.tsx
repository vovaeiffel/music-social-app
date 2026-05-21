"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import dynamic from "next/dynamic";

const supabase = createSupabaseClient();

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

  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [story, setStory] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [pins, setPins] = useState<PinType[]>([]);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);

  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [spotifyUrl, setSpotifyUrl] = useState("");

  const [yandexUrl, setYandexUrl] = useState("");

  const [editingPinId, setEditingPinId] = useState<string | null>(null);

  const [isCreatingPin, setIsCreatingPin] = useState(false);

  const [selectedPin, setSelectedPin] = useState<PinType | null>(null);

  useEffect(() => {
    async function init() {
      await checkUser();
      await loadPins();
      await getLocation();
    }

    init();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-pins")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pins",
        },
        async () => {
          await loadPins(user?.id);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
        },
        async () => {
          await loadPins(user?.id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function getLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLat(position.coords.latitude);

        setSelectedLng(position.coords.longitude);
      },
      (error) => {
        console.error(error);
        alert("Could not get location");
      },
    );
  }

  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  async function loadPins(currentUserId?: string) {
    const { data: pinsData, error } = await supabase
      .from("pins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (!pinsData) {
      setPins([]);
      return;
    }

    const updatedPins = await Promise.all(
      pinsData.map(async (pin) => {
        const { count } = await supabase
          .from("likes")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("pin_id", pin.id);

        let likedByUser = false;

        if (currentUserId) {
          const { data: existingLike } = await supabase
            .from("likes")
            .select("id")
            .eq("pin_id", pin.id)
            .eq("user_id", currentUserId)
            .maybeSingle();

          likedByUser = !!existingLike;
        }

        return {
          ...pin,
          likes_count: count || 0,
          liked_by_user: likedByUser,
        };
      }),
    );

    setPins(updatedPins);
  }

  async function toggleLike(pinId: string, liked: boolean) {
    if (!user) return;

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("pin_id", pinId)
        .eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({
        pin_id: pinId,
        user_id: user.id,
      });
    }

    await loadPins(user.id);
    if (selectedPin) {
      const updatedPins = await supabase
        .from("pins")
        .select("*")
        .eq("id", selectedPin.id)
        .single();

      if (updatedPins.data) {
        setSelectedPin({
          ...updatedPins.data,
          likes_count: liked
            ? (selectedPin.likes_count || 1) - 1
            : (selectedPin.likes_count || 0) + 1,

          liked_by_user: !liked,
        });
      }
    }
  }

  async function deletePin(pinId: string) {
    const { error } = await supabase.from("pins").delete().eq("id", pinId);

    if (error) {
      console.error(error);
      alert("Error deleting pin");
      return;
    }

    await loadPins();
  }

  async function createPin() {
    if (!user) return;

    if (!selectedLat || !selectedLng) {
      alert("Select place on map");
      return;
    }

    if (!songTitle.trim() || !story.trim()) {
      alert("Fill required fields");

      return;
    }

    // EDIT EXISTING PIN
    if (editingPinId) {
      const { error } = await supabase
        .from("pins")
        .update({
          song_title: songTitle,
          artist_name: artistName,
          story: story,
          place_name: placeName,

          youtube_url: youtubeUrl,
          spotify_url: spotifyUrl,
          yandex_url: yandexUrl,

          latitude: selectedLat,
          longitude: selectedLng,
        })
        .eq("id", editingPinId);

      if (error) {
        console.error(error);
        alert("Error updating pin");
        return;
      }

      alert("Pin updated!");

      setEditingPinId(null);
    }

    // CREATE NEW PIN
    else {
      const { error } = await supabase.from("pins").insert({
        user_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar,

        song_title: songTitle,
        artist_name: artistName,
        story: story,
        place_name: placeName,

        youtube_url: youtubeUrl,
        spotify_url: spotifyUrl,
        yandex_url: yandexUrl,

        latitude: selectedLat,
        longitude: selectedLng,
      });

      if (error) {
        console.error(error);
        alert("Error creating pin");
        return;
      }

      alert("Pin created!");
    }

    await loadPins(user.id);

    setSongTitle("");
    setArtistName("");
    setStory("");
    setPlaceName("");

    setYoutubeUrl("");
    setSpotifyUrl("");
    setYandexUrl("");

    setSelectedLat(null);
    setSelectedLng(null);

    setIsCreatingPin(false);
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

              <div className="text-zinc-400 space-y-3">
                <div
                  className="
    mt-6
    p-4
    rounded-xl
    bg-zinc-800
    text-white
  "
                >
                  <div className="flex items-center gap-3">
                    {user?.avatar && (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                      />
                    )}

                    <div>
                      <p className="font-semibold">
                        {user?.name || user?.email || "User"}
                      </p>

                      <p className="text-xs text-zinc-400">Logged in</p>
                    </div>
                  </div>
                </div>
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
                  <h2 className="text-xl font-bold">Create Pin</h2>

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
                      type="button"
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
                      Create
                    </button>

                    <button
                      onClick={() => {
                        setIsCreatingPin(false);

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
