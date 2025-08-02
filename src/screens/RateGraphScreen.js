// src/screens/RateGraphScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RateGraphScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📈 Rate Graph Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
