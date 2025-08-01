import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { getRates } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CurrencyDropdown from "../components/CurrencyDropdown";

export default function HomeScreen({ navigation }) {
  const [amount, setAmount] = useState("");
  const [converted, setConverted] = useState("");
  const [rate, setRate] = useState(null);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRate();
  }, [fromCurrency, toCurrency]);

  const fetchRate = async () => {
    try {
      const rates = await getRates(fromCurrency);
      const selectedRate = rates[toCurrency];
      if (selectedRate) {
        setRate(selectedRate);
        await AsyncStorage.setItem("lastRate", JSON.stringify(selectedRate));
      } else {
        throw new Error("Invalid toCurrency in response");
      }
    } catch (error) {
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
    animateResult();
  };

  const animateResult = () => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start();
  };

  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  const getFlag = (currencyCode) => {
    const code = currencyCode.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/w40/${code}.png`; // Use 2-letter ISO flag prefix
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/exchange.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>MoneySwap</Text>
      </View>

      {/* Input */}
      <TextInput
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        placeholderTextColor="#888"
      />

      {/* Currency Selection */}
      <View style={styles.row}>
        <View style={styles.dropdownContainer}>
          <Image source={{ uri: getFlag(fromCurrency) }} style={styles.flag} />
          <CurrencyDropdown
            label="From"
            value={fromCurrency}
            onPress={() =>
              navigation.navigate("CurrencySelection", {
                onSelect: setFromCurrency,
              })
            }
          />
        </View>
        <View style={styles.dropdownContainer}>
          <Image source={{ uri: getFlag(toCurrency) }} style={styles.flag} />
          <CurrencyDropdown
            label="To"
            value={toCurrency}
            onPress={() =>
              navigation.navigate("CurrencySelection", {
                onSelect: setToCurrency,
              })
            }
          />
        </View>
      </View>

      {/* Convert Button */}
      <TouchableOpacity style={styles.convertButton} onPress={handleConvert}>
        <Text style={styles.convertText}>Convert</Text>
      </TouchableOpacity>

      {/* Animated Result */}
      {converted ? (
        <Animated.View style={[styles.resultContainer, animatedStyle]}>
          <Text style={styles.result}>
            Converted: {toCurrency} {converted}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
    justifyContent: "flex-start",
  },
  header: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  flag: {
    width: 30,
    height: 20,
    marginRight: 8,
    borderRadius: 4,
  },
  convertButton: {
    backgroundColor: "#4e91fc",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  convertText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  result: {
    fontSize: 22,
    color: "#333",
    fontWeight: "bold",
  },
});
