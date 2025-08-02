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
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { deleteUser } from "firebase/auth";
import { collection, deleteDoc, getDocs, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const { logout, preferences, updatePreferences, user } = useContext(AuthContext);
  const navigation = useNavigation();

  const toggleDarkMode = () => {
    updatePreferences({ ...preferences, darkMode: !preferences.darkMode });
  };

  const clearHistory = async () => {
    Alert.alert("Clear History", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        onPress: async () => {
          try {
            const historyRef = collection(db, "history", user.uid, "conversions");
            const snapshot = await getDocs(historyRef);
            const deletePromises = snapshot.docs.map((docItem) =>
              deleteDoc(doc(db, "history", user.uid, "conversions", docItem.id))
            );
            await Promise.all(deletePromises);
            Alert.alert("Success", "Conversion history cleared.");
          } catch (error) {
            console.error("Error clearing history:", error.message);
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const historyRef = collection(db, "history", user.uid, "conversions");
            const snapshot = await getDocs(historyRef);
            const deletePromises = snapshot.docs.map((docItem) =>
              deleteDoc(doc(db, "history", user.uid, "conversions", docItem.id))
            );
            await Promise.all(deletePromises);
            await deleteUser(auth.currentUser);
            logout();
          } catch (error) {
            console.error("Error deleting account:", error.message);
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const isDark = preferences.darkMode;
  const bgColor = isDark ? "#000" : "#f5f5f5";
  const textColor = isDark ? "#fff" : "#000";
  const cardColor = isDark ? "#1c1c1e" : "#fff";

  return (
    <ScrollView style={{ backgroundColor: bgColor, flex: 1 }}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Settings</Text>

        <View style={styles.profileSection}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle" size={80} color="#aaa" />
          )}
          <Text style={[styles.emailText, { color: textColor }]}>
            {user.email || "User"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: textColor }]}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleDarkMode} />
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#4e91fc" }]} onPress={clearHistory}>
          <Text style={styles.buttonText}>Clear Conversion History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#e74c3c" }]} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#555" }]} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
