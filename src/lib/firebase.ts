/**
 * src/lib/firebase.ts
 *
 * Initializes the Firebase app exactly once (guards against Next.js
 * hot-reload re-runs), then exports the core service handles:
 *   - app   → the Firebase App instance
 *   - auth  → Firebase Authentication
 *   - db    → Cloud Firestore (journal proof storage)
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForBuilds",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "12345",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:12345:web:12345",
};

// Guard: re-use the already-initialised app on hot-reloads instead of
// throwing "Firebase App named '[DEFAULT]' already exists".
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const requiredConfigKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const isConfigured = requiredConfigKeys.every((key) => {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
});

const auth: Auth = isConfigured 
  ? getAuth(app) 
  : ({ currentUser: null } as unknown as Auth);

const db: Firestore = isConfigured 
  ? initializeFirestore(app, { localCache: persistentLocalCache() }) 
  : ({} as Firestore);

export { app, auth, db, isConfigured };
