/**
 * Firebase Configuration
 * Initializes Firebase app, auth, and analytics.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDubolZjRbiiCV9YubAMNeor3XpfllW6Ds",
  authDomain: "here-now-bf51b.firebaseapp.com",
  projectId: "here-now-bf51b",
  storageBucket: "here-now-bf51b.firebasestorage.app",
  messagingSenderId: "342649590002",
  appId: "1:342649590002:web:8e612233dc862ef11a406b",
  measurementId: "G-CRBHFJS9D6",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
