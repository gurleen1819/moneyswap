import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getRateHistory } from "../utils/api";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

const screenWidth = Dimensions.get("window").width;

export default function RateGraphScreen() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { colors, dark } = useTheme();
  const { preferences } = useContext(AuthContext);

  const baseCurrency = preferences.baseCurrency;
  const targetCurrency = preferences.targetCurrency;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - 1);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 8);

        const format = (d) => d.toISOString().split("T")[0];

        const data = await getRateHistory(
          baseCurrency,
          targetCurrency,
          format(startDate),
          format(endDate)
        );

        if (!data || !data.rates || Object.keys(data.rates).length === 0) {
          setError("No data available");
          setGraphData(null);
          setLoading(false);
          return;
        }

        const sortedDates = Object.keys(data.rates).sort();
        const labels = sortedDates.map((date) => date.slice(5));
        const values = sortedDates.map(
          (date) => data.rates[date][targetCurrency]
        );

        setGraphData({ labels, datasets: [{ data: values }] });
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rate history:", err);
        setError("Failed to fetch data");
        setGraphData(null);
        setLoading(false);
      }
    };

    fetchData();
  }, [baseCurrency, targetCurrency]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading exchange rates...</Text>
      </View>
    );
  }

  if (error || !graphData) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error || "red" }}>{error || "No data"}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        📈 {baseCurrency} → {targetCurrency} Exchange Rate (Last 8 Days)
      </Text>
      <LineChart
        data={graphData}
        width={screenWidth - 32}
        height={250}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: dark ? "#222" : "#e0f0ff",
          backgroundGradientTo: dark ? "#121212" : "#ffffff",
          decimalPlaces: 4,
          color: (opacity = 1) => `rgba(78, 145, 252, ${opacity})`,
          labelColor: (opacity = 1) =>
            `rgba(${dark ? "255, 255, 255" : "0, 0, 0"}, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: "4", strokeWidth: "2", stroke: "#4e91fc" },
        }}
        bezier
        style={{ marginVertical: 16, borderRadius: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: "center", justifyContent: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center" },
});
