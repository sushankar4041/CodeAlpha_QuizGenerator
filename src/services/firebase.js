import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

/**
 * Firebase Realtime Database & Auth Config
 * Uses environment variables if set, with safe fallback demo project config.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoConfigKeyForQuizelleProject",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quiz-generator-quizelle.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://quiz-generator-quizelle-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quiz-generator-quizelle",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quiz-generator-quizelle.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100000000000:web:abcdef123456"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Realtime Database & Auth
export const database = getDatabase(app);
export const auth = getAuth(app);

/**
 * Ensures an anonymous authenticated user exists before Live Quiz operations.
 * Returns the authoritative Firebase Auth User object.
 */
export const ensureAnonymousAuth = async () => {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase Anonymous Auth Error:', error);
    // Safe fallback object for offline / demo mode
    return auth.currentUser || { uid: `anon-${Date.now()}` };
  }
};

export default app;
