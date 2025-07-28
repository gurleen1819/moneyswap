// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCy1G0gYRL2995rjPzh_7idaDzCPDsg39M",
  authDomain: "moneyswap-e77f7.firebaseapp.com",
  projectId: "moneyswap-e77f7",
  storageBucket: "moneyswap-e77f7.appspot.com",
  messagingSenderId: "509032365235",
  appId: "1:509032365235:web:43abd3b2262206298844c6",
  measurementId: "G-MCZV3QG1TW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
