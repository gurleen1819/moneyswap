import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function CurrencySelectionScreen({ route, navigation }) {
  const { onSelect } = route.params;
  const [search, setSearch] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
  }, []);
const fetchCurrencies = async () => {
  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,currencies"
    );
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Expected an array but got:", data);
      setCurrencies([]);
      setLoading(false);
      return;
    }

    const currencyMap = {};
    data.forEach((country) => {
      if (country.currencies) {
        Object.entries(country.currencies).forEach(([code, details]) => {
          if (!currencyMap[code]) {
            currencyMap[code] = details.name;
          }
        });
      }
    });

    const currencyArray = Object.entries(currencyMap).map(([code, name]) => ({
      code,
      name,
    }));

    currencyArray.sort((a, b) => a.code.localeCompare(b.code));

    setCurrencies(currencyArray);
  } catch (error) {
    console.error("Error fetching currencies:", error);
  } finally {
    setLoading(false);
  }
};


  // Filter by search
  const filtered = currencies.filter(
    (item) =>
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#4e91fc" />
      </View>
    );
  }

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
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No currencies found
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    borderColor: "#ccc",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  code: { fontWeight: "bold" },
});
