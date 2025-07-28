import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CurrencyDropdown({ label, value, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}: {value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 15, backgroundColor: "#ddd", borderRadius: 8, marginVertical: 8 },
  text: { fontSize: 16 }
});
