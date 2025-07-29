// screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image } from "react-native";
import { getRates } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CurrencyDropdown from "../components/CurrencyDropdown";

export default function HomeScreen({ navigation }) {
  const [amount, setAmount] = useState("");
  const [converted, setConverted] = useState("");
  const [rate, setRate] = useState(null);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");

  useEffect(() => {
    fetchRate();
  }, [fromCurrency, toCurrency]);

  const fetchRate = async () => {
    try {
      console.log("Fetching rates for:", fromCurrency);
      const rates = await getRates(fromCurrency);
      console.log("Rates received:", rates);

      if (!rates) throw new Error("No rates returned");

      const selectedRate = rates[toCurrency];
      if (selectedRate) {
        setRate(selectedRate);
        await AsyncStorage.setItem("lastRate", JSON.stringify(selectedRate));
      } else {
        throw new Error("Invalid toCurrency in response");
      }
    } catch (error) {
      console.warn("Error fetching rates:", error.message);
      const cachedRate = await AsyncStorage.getItem("lastRate");
      if (cachedRate) {
        setRate(JSON.parse(cachedRate));
      } else {
        alert("Exchange rate not available. Please try again later.");
      }
    }
  };

  const handleConvert = () => {
    if (!amount || isNaN(amount)) return;
    if (!rate) {
      alert("Exchange rate not available. Please try again later.");
      return;
    }
    const result = parseFloat(amount) * rate;
    setConverted(result.toFixed(2));
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/exchange.png")}  style={styles.logo} />
      <Text style={styles.title}>MoneySwap</Text>

      <TextInput
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <CurrencyDropdown
        label="From"
        value={fromCurrency}
        onPress={() =>
          navigation.navigate("CurrencySelection", { onSelect: setFromCurrency })
        }
      />
      <CurrencyDropdown
        label="To"
        value={toCurrency}
        onPress={() =>
          navigation.navigate("CurrencySelection", { onSelect: setToCurrency })
        }
      />

      <Button title="Convert" onPress={handleConvert} />

      {converted ? (
        <Text style={styles.result}>
          Converted: {toCurrency} {converted}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, marginBottom: 15, padding: 10, borderRadius: 5 },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 10,
  },
  result: { fontSize: 20, marginTop: 15, textAlign: "center" },
});
