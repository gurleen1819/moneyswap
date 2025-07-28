import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const currencies = [
  { code: "USD", name: "US Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CAD", name: "Canadian Dollar" },
  // Add more currencies as needed
];

export default function CurrencySelectionScreen({ route, navigation }) {
  const { onSelect } = route.params;
  const [search, setSearch] = useState("");

  const filtered = currencies.filter(
    (item) =>
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search currency"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              onSelect(item.code);
              navigation.goBack();
            }}
          >
            <Text style={styles.code}>{item.code}</Text>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 },
  item: { flexDirection: "row", justifyContent: "space-between", padding: 15, borderBottomWidth: 1 },
  code: { fontWeight: "bold" }
});
