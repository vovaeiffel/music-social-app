import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Импортируем enableIndexedDbPersistence
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Инициализируем Firestore
export const db = getFirestore(app);

// Пытаемся включить локальное кэширование, чтобы данные подгружались из памяти,
// если сеть "отвалилась"
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn(
        "Multiple tabs open, persistence disabled in secondary tabs.",
      );
    } else if (err.code === "unimplemented") {
      console.warn("Browser doesn't support persistence.");
    }
  });
} catch (e) {
  console.error(e);
}
