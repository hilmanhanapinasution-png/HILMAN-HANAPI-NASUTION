import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration for Firebase
const firebaseConfig = {
  projectId: "angular-citadel-nk8sk",
  appId: "1:1061460064625:web:9fcf944d2630a361df1ed0",
  apiKey: "AIzaSyAyPHcvGCjbmCNooHAxKtL4_wnykvQqGpQ",
  authDomain: "angular-citadel-nk8sk.firebaseapp.com",
  databaseId: "ai-studio-0dd5e88f-5426-4382-9428-6af347a4ff40",
  storageBucket: "angular-citadel-nk8sk.firebasestorage.app",
  messagingSenderId: "1061460064625"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the databaseId provisioned by Firebase
const db = getFirestore(app, firebaseConfig.databaseId);

export { app, db };
