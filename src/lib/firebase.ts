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
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase is actually configured
const isConfigured = !!firebaseConfig.apiKey;

// Guard: re-use the already-initialised app on hot-reloads instead of
// throwing "Firebase App named '[DEFAULT]' already exists".
const app: FirebaseApp = isConfigured 
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) 
  : ({} as FirebaseApp);

const auth: Auth = isConfigured 
  ? getAuth(app) 
  : ({ currentUser: null } as unknown as Auth);

const db: Firestore = isConfigured 
  ? initializeFirestore(app, { localCache: persistentLocalCache() }) 
  : ({} as Firestore);

export { app, auth, db, isConfigured };
