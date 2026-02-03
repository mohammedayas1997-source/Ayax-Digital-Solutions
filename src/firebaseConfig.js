import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBv1uD0HLzXntNV-Kp06M63TIP1GqUF3c4",
  authDomain: "ayax-digital-solutions.firebaseapp.com",
  projectId: "ayax-digital-solutions",
  storageBucket: "ayax-digital-solutions.firebasestorage.app",
  messagingSenderId: "253800759881",
  appId: "1:253800759881:web:77bb4f78233f387f9ff598",
  measurementId: "G-WZ23YW88SX"
};

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Export Services (Hanya mafi sauki kuma ingantacciya)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;