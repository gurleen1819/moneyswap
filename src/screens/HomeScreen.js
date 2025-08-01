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

  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  };

  useEffect(() => {
    fetchRate();
    setConverted("");
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (amount && !isNaN(amount) && rate) {
      const result = parseFloat(amount) * rate;
      setConverted(result.toFixed(2));
      animateResult();
    } else {
      setConverted("");
    }
  }, [amount, rate]);

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

  const animateResult = () => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start();
  };

  const handleKeyPress = (key) => {
    if (key === "⌫") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === ".") {
      if (!amount.includes(".")) {
        setAmount((prev) => (prev ? prev + key : "0."));
      }
    } else {
      setAmount((prev) => (prev === "0" ? key : prev + key));
    }
  };

  const getFlag = (currencyCode) => {
    const code = currencyCode.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/w40/${code}.png`;
  };

  const keypadButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "⌫"],
  ];

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
        style={styles.input}
        placeholderTextColor="#888"
        editable={false}
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

      {/* Show exchange rate */}
      {rate && (
        <Text style={styles.rateText}>
          1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
        </Text>
      )}

      {/* Keypad */}
      <View style={styles.keypad}>
        {keypadButtons.map((row, i) => (
          <View key={i} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.keypadButton}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keypadText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Result */}
      {converted ? (
        <Animated.View style={[styles.resultContainer, animatedStyle]}>
          <Text style={styles.result}>
            {amount} {fromCurrency} = {converted} {toCurrency}
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
    fontSize: 24,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    textAlign: "right",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
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
  rateText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
  },
  keypad: {
    marginBottom: 20,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  keypadButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#4e91fc",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  keypadText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
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
