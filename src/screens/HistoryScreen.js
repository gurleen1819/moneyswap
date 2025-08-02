import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { formatDistanceToNow } from "date-fns";

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const auth = getAuth();

  const fetchHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setHistory([]);
        setLoading(false);
        return;
      }
      const q = query(collection(db, "users", user.uid, "history"));
      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(historyData);
    } catch (error) {
      console.warn("Error fetching history:", error.message);
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

      <View style={styles.divider} />

      <Text style={styles.result}>
        = {item.result} {item.to}
      </Text>

      <Text style={styles.date}>
        {item.createdAt
          ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })
          : "Just now"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exchange History</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2e86de" />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No exchange history found.</Text>
        </View>
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
  container: { flex: 1, padding: 16, backgroundColor: "#f7f9fc" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#2e86de",
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 12,
    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    // Elevation Android
    elevation: 5,
  },
  text: {
    fontSize: 18,
    color: "#333",
  },
  result: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    color: "#27ae60",
  },
  date: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    marginTop: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
