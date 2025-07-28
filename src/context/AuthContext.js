import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
//  // if AuthContext is inside src/context/
import { auth } from "../services/firebase";
// ✅ Correct path





export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({ darkMode: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setPreferences(userDoc.data());
        } else {
          await setDoc(doc(db, "users", currentUser.uid), preferences);
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
      await setDoc(doc(db, "users", user.uid), newPrefs);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout: () => signOut(auth), preferences, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};
