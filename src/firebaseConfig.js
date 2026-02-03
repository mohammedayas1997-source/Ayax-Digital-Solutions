import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // 1. Mun kara wannan import din

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// 2. Dole a fara initialize app kafin kowa
const app = initializeApp(firebaseConfig);

// 3. Yanzu sai a fitar da sauran abubuwan
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); 

// KAR KA SAKE YIN "export { db, storage }" A KASA. 
// Tunda ka sa "export" a gaban "const", ya riga ya tafi.