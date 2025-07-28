import React, { useContext } from "react";
import { View, Text, Switch, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function SettingsScreen() {
  const { logout, preferences, updatePreferences } = useContext(AuthContext);

  const toggleDarkMode = () => {
    updatePreferences({ ...preferences, darkMode: !preferences.darkMode });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={preferences.darkMode} onValueChange={toggleDarkMode} />
      </View>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  label: { fontSize: 18 }
});
