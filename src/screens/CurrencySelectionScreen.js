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
import { useTheme } from "@react-navigation/native";

export default function CurrencySelectionScreen({ route, navigation }) {
  const { onSelect } = route.params;
  const { colors } = useTheme();

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

  const filtered = currencies.filter(
    (item) =>
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        placeholder="Search currency"
        placeholderTextColor={colors.text + "99"} 
        value={search}
        onChangeText={setSearch}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => {
              onSelect(item.code);
              navigation.goBack();
            }}
          >
            <Text style={[styles.code, { color: colors.text }]}>{item.code}</Text>
            <Text style={{ color: colors.text }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: colors.text,
            }}
          >
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
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
  },
  code: { fontWeight: "bold" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
});
