import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getRateHistory } from "../utils/api"; 

const screenWidth = Dimensions.get("window").width;

export default function RateGraphScreen() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const baseCurrency = "USD";
  const targetCurrency = "INR";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - 1); 
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 8); 

        const format = (d) => d.toISOString().split("T")[0];

        console.log("Fetching rates from", format(startDate), "to", format(endDate));

        const data = await getRateHistory(
          baseCurrency,
          targetCurrency,
          format(startDate),
          format(endDate)
        );

        console.log("Rate history API data:", data);

        if (!data || !data.rates || Object.keys(data.rates).length === 0) {
          setError("No data available");
          setLoading(false);
          return;
        }

        const sortedDates = Object.keys(data.rates).sort();
        const labels = sortedDates.map((date) => date.slice(5)); // MM-DD
        const values = sortedDates.map((date) => data.rates[date][targetCurrency]);

        setGraphData({
          labels,
          datasets: [{ data: values }],
        });

        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4e91fc" />
        <Text>Loading exchange rates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        📈 {baseCurrency} → {targetCurrency} Exchange Rate (Last 8 Days)
      </Text>
      <LineChart
        data={graphData}
        width={screenWidth - 32}
        height={250}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: "#f5f5f5",
          backgroundGradientFrom: "#e0f0ff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 4,
          color: (opacity = 1) => `rgba(78, 145, 252, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
