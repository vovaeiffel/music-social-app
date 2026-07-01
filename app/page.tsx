"use client";

import { useState } from "react";
import ProfilePanel from "./components/profile/ProfilePanel";
import ProfileOverlay from "./components/overlays/ProfileOverlay";
import UserProfilePanel from "./components/profile/UserProfilePanel";
import { useCreatePinStore } from "@/app/store/createPinStore";
import { useAuth } from "@/app/hooks/useAuth";
import { startEditPin } from "@/app/utils/pinEditor";
import { filterPinsForMap, type MapMode } from "@/app/utils/mapMode";
import AppTips from "./components/AppTips";
import { getUserProfile } from "@/app/services/userService";
import { deletePin as deletePinAction } from "@/app/utils/pinDelete";
import MapContainer from "@/app/components/map/MapContainer";
import { usePinsSync } from "@/app/hooks/usePinsSync";

import type { UserProfileType } from "@/app/types/user";
import { usePinStore } from "@/app/store/pinStore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import WelcomeScreen from "./components/WelcomeScreen";

export default function Home() {
  const { setIsCreatingPin, resetForm } = useCreatePinStore();

  const { user, profile, setProfile, loading, signInWithGoogle } = useAuth();
  const { myPinsCount, toggleLike, createPin, savedPins } = usePinsSync(
    user?.id,
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] =
    useState<UserProfileType | null>(null);

  const [searchPos, setSearchPos] = useState<[number, number] | null>(null);
  const [isShowingSaved, setIsShowingSaved] = useState(false);

  const selectedPin = usePinStore((state) => state.selectedPin);
  const setSelectedPin = usePinStore((state) => state.setSelectedPin);
  const pins = usePinStore((state) => state.pins);

  const handleStartNewPin = () => {
    resetForm();
    setIsCreatingPin(true);
  };

  const [mapMode, setMapMode] = useState<MapMode>("global");

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
            user={user} // ← теперь TS доволен, потому что user точно НЕ null
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
            {isProfileOverlayOpen && user && (
              <ProfileOverlay
                user={user}
                profile={profile}
                pins={pins}
                myPinsCount={myPinsCount}
                setProfile={setProfile}
                onClose={() => setIsProfileOverlayOpen(false)}
              />
            )}

            <MapContainer
              pins={filterPinsForMap(
                pins,
                mapMode,
                user.id,
                selectedUserProfile,
              )}
              createPin={() => createPin(user!)}
              toggleLike={toggleLike}
              currentUserId={user.id}
              currentUserName={user.name || ""}
              currentUserAvatar={user.avatar || ""}
              onEditPin={(pin) => startEditPin({ pin })}
              onDeletePin={(pinId) =>
                deletePinAction({
                  pinId,
                  selectedPinId: selectedPin?.id,
                  clearSelectedPin: () => setSelectedPin(null),
                })
              }
              onOpenUserProfile={async (userId) => {
                const profileData = await getUserProfile(userId);
                setSelectedUserProfile(profileData);
                setIsUserProfileOpen(true);
              }}
              onPrepareNewPin={handleStartNewPin}
              searchPos={searchPos}
              mapMode={mapMode}
              setMapMode={setMapMode}
              setSearchPos={setSearchPos}
            />
          </div>
        </div>
      ) : (
        <WelcomeScreen onGoogleLogin={signInWithGoogle} />
      )}
    </main>
  );
}
