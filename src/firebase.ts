import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "slagheap-7f791.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "slagheap-7f791",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "slagheap-7f791.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "985062474894",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "slagheap-gen-v1"
};

export const hasFirebase = !!firebaseConfig.apiKey;

export const fApp = hasFirebase ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
export const fAuth = hasFirebase ? getAuth(fApp!) : null as any;
export const fDb = hasFirebase ? getFirestore(fApp!) : null as any;
export const appId = 'slag-heap-gen';
