import React, { useContext } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { deleteUser } from "firebase/auth";
import {
  collection,
  getDocs,
  writeBatch,
  doc as fsDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function SettingsScreen() {
  const { logout, preferences, updatePreferences, user } = useContext(AuthContext);

  const toggleDarkMode = () => {
    updatePreferences({ ...preferences, darkMode: !preferences.darkMode });
  };

  const clearHistory = () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "You must be signed in.");
      return;
    }

    Alert.alert("Clear History", "Are you sure you want to delete all history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        onPress: async () => {
          try {
            const historyRef = collection(db, "users", uid, "history");
            const snap = await getDocs(historyRef);

            if (snap.empty) {
              Alert.alert("Done", "No history to clear.");
              return;
            }

            const batch = writeBatch(db);
            snap.docs.forEach((d) => {
              batch.delete(fsDoc(db, "users", uid, "history", d.id));
            });
            await batch.commit();

            Alert.alert("Success", "Conversion history cleared.");
          } catch (e) {
            console.warn("Error clearing history:", e);
            Alert.alert("Error", e?.message ?? "Failed to clear history.");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "You must be signed in.");
      return;
    }

    Alert.alert(
      "Delete Account",
      "This will remove your history and delete your account. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // 1) Delete history subcollection
              const historyRef = collection(db, "users", uid, "history");
              const snap = await getDocs(historyRef);
              if (!snap.empty) {
                const batch = writeBatch(db);
                snap.docs.forEach((d) =>
                  batch.delete(fsDoc(db, "users", uid, "history", d.id))
                );
                await batch.commit();
              }

              // 2) (Optional) delete the user profile document if you created one
              // Safe to ignore if it doesn't exist
              try {
                await deleteDoc(fsDoc(db, "users", uid));
              } catch (_) {}

              // 3) Delete the Auth user
              await deleteUser(auth.currentUser);

              // 4) Log out locally
              logout();
            } catch (e) {
              // If you get "requires recent login", prompt the user to re-login first.
              console.warn("Error deleting account:", e);
              Alert.alert("Error", e?.message ?? "Failed to delete account.");
            }
          },
        },
      ]
    );
  };

  const isDark = preferences.darkMode;
  const bgColor = isDark ? "#000" : "#f5f5f5";
  const textColor = isDark ? "#fff" : "#000";

  return (
    <ScrollView style={{ backgroundColor: bgColor, flex: 1 }}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>

        <View style={styles.profileSection}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle" size={80} color="#aaa" />
          )}
          <Text style={[styles.emailText, { color: textColor }]}>
            {user?.email || "User"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: textColor }]}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleDarkMode} />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#4e91fc" }]}
          onPress={clearHistory}
        >
          <Text style={styles.buttonText}>Clear Conversion History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#e74c3c" }]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#555" }]}
          onPress={logout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, flex: 1 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 25, textAlign: "center" },
  profileSection: { alignItems: "center", marginBottom: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  emailText: { fontSize: 16, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  label: { fontSize: 18, fontWeight: "500" },
  button: { padding: 15, borderRadius: 10, marginBottom: 15, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
