import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Cek saat development: kalau env belum di-set, kasih pesan jelas (bukan invalid-api-key)
if (typeof window !== "undefined" && !firebaseConfig.apiKey) {
  console.error(
    "[Firebase] Config belum di-set. Buat file .env.local dari .env.local.example dan isi dengan credential dari Firebase Console."
  );
}

// Initialize Firebase (Singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize Analytics (client-side only)
// Analytics hanya bisa digunakan di browser, tidak di server-side/SSR
let analytics = null;
if (typeof window !== 'undefined') {
  // Check if analytics is supported in this environment
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn('Firebase Analytics not supported:', err);
  });
}

export { app, auth, db, storage, functions, analytics };
