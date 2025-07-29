import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase"; // ✅ FIXED: Added db

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({ darkMode: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setPreferences(userDoc.data());
          } else {
            await setDoc(doc(db, "users", currentUser.uid), preferences);
          }
        } catch (e) {
          console.error("Failed to load user preferences:", e.message);
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const updatePreferences = async (newPrefs) => {
    setPreferences(newPrefs);
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), newPrefs);
      } catch (e) {
        console.error("Failed to update preferences:", e.message);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, preferences, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};
