
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { db, auth } from "../services/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const historyRef = collection(db, "users", user.uid, "history");
      const q = query(historyRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setHistory(data);
    } catch (e) {
      console.warn("Error fetching history:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}>
        {item.amount} {item.from} → {item.to}
      </Text>
      <Text style={styles.result}>
        = {item.result} {item.to}
      </Text>
      <Text style={styles.date}>
        {item.createdAt?.toDate?.().toLocaleString() || "Just now"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exchange History</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  card: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    marginVertical: 8,
    borderRadius: 10,
  },
  text: { fontSize: 16 },
  result: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  date: { fontSize: 12, color: "#666", marginTop: 4 }, 
});
