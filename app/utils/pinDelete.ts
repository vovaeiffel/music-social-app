import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { usePinStore } from "@/app/store/pinStore";

type Params = {
  pinId: string;
  selectedPinId?: string;
  clearSelectedPin: () => void;
};

export async function deletePin({
  pinId,
  selectedPinId,
  clearSelectedPin,
}: Params) {
  try {
    await deleteDoc(doc(db, "pins", pinId));

    const { pins, setPins } = usePinStore.getState();
    const updatedPins = pins.filter((p) => p.id !== pinId);
    setPins(updatedPins);

    if (selectedPinId === pinId) {
      clearSelectedPin();
    }
  } catch (error) {
    console.error(error);
    alert("Error deleting pin");
  }
}
