import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export const AuthContext = createContext();

const DEFAULT_PREFS = {
  darkMode: false,
  baseCurrency: "USD",
  targetCurrency: "INR",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFS);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const ref = doc(db, "users", currentUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            // merge with defaults to avoid missing keys
            const merged = { ...DEFAULT_PREFS, ...data };
            setPreferences(merged);
            // if doc was missing some keys, save back
            if (JSON.stringify(merged) !== JSON.stringify(data)) {
              await setDoc(ref, merged, { merge: true });
            }
          } else {
            await setDoc(ref, DEFAULT_PREFS);
            setPreferences(DEFAULT_PREFS);
          }
        } catch (e) {
          console.error("Failed to load user preferences:", e.message);
        }
      } else {
        setUser(null);
        setPreferences(DEFAULT_PREFS);
      }
    });

    return unsubscribe;
  }, []);

  const updatePreferences = async (newPrefs) => {
    setPreferences(newPrefs);
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), newPrefs, { merge: true });
      } catch (e) {
        console.error("Failed to update preferences:", e.message);
      }
    }
  };

  // Convenience setters that update Firestore too
  const setBaseCurrency = async (base) => {
    const next = { ...preferences, baseCurrency: base };
    await updatePreferences(next);
  };

  const setTargetCurrency = async (target) => {
    const next = { ...preferences, targetCurrency: target };
    await updatePreferences(next);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        preferences,
        updatePreferences,
        setBaseCurrency,
        setTargetCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
