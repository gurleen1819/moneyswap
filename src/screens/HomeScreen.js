import React, { useEffect, useState, useRef, useContext } from "react";
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
import { useTheme } from "@react-navigation/native";
import { getRates } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CurrencyDropdown from "../components/CurrencyDropdown";
import { Ionicons } from "@expo/vector-icons";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("");
  const [converted, setConverted] = useState("");
  const [rate, setRate] = useState(null);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const animatedValue = useRef(new Animated.Value(0)).current;

  const saveToHistory = async ({ amount, from, to, result }) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const historyRef = collection(db, "users", user.uid, "history");
      await addDoc(historyRef, {
        amount,
        from,
        to,
        result,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Error saving history:", e.message);
    }
  };

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

  const onConvertPress = async () => {
    if (amount && !isNaN(amount) && rate) {
      try {
        const result = parseFloat(amount) * rate;
        const roundedResult = result.toFixed(2);
        setConverted(roundedResult);
        animateResult();

        await saveToHistory({
          amount,
          from: fromCurrency,
          to: toCurrency,
          result: roundedResult,
        });
      } catch (err) {
        console.warn("Conversion error:", err.message);
      }
    } else {
      alert("Please enter a valid amount.");
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topContent}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/exchange.png")}
            style={styles.logo}
          />
          <Text style={[styles.title, { color: colors.text }]}>MoneySwap</Text>
        </View>

        <TextInput
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholderTextColor={colors.text + "99"}
          editable={false}
        />

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

          <TouchableOpacity onPress={onConvertPress} style={styles.convertButton}>
            <Ionicons name="swap-horizontal" size={32} color={colors.primary} />
          </TouchableOpacity>

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

        {rate && (
          <Text style={[styles.rateText, { color: colors.text }]}>
            1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
          </Text>
        )}

        {converted ? (
          <Animated.View style={[styles.resultContainer, animatedStyle]}>
            <Text style={[styles.result, { color: colors.text }]}>
              {amount} {fromCurrency} = {converted} {toCurrency}
            </Text>
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.bottomContent}>
        <View style={styles.keypad}>
          {keypadButtons.map((row, i) => (
            <View key={i} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.keypadButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleKeyPress(key)}
                >
                  <Text style={[styles.keypadText, { color: colors.background }]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  topContent: {
    flexShrink: 1,
  },
  bottomContent: {
    marginTop: 10,
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
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 24,
    borderWidth: 1,
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
    alignItems: "center",
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
  convertButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  rateText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 15,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  keypadButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  keypadText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  resultContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  result: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
