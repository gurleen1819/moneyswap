import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyCy1G0gYRL2995rjPzh_7idaDzCPDsg39M",
  authDomain: "moneyswap-e77f7.firebaseapp.com",
  projectId: "moneyswap-e77f7",
  storageBucket: "moneyswap-e77f7.appspot.com",
  messagingSenderId: "509032365235",
  appId: "1:509032365235:web:43abd3b2262206298844c6",
  measurementId: "G-MCZV3QG1TW"
};


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];


let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);
