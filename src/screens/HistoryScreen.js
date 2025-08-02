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
import { useTheme } from "@react-navigation/native";

export default function HistoryScreen() {
  const { colors } = useTheme();
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
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {item.amount} {item.from} → {item.to}
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[styles.result, { color: colors.primary }]}>
        = {item.result} {item.to}
      </Text>

      <Text style={[styles.date, { color: colors.text }]}>
        {item.createdAt
          ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })
          : "Just now"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Exchange History</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No exchange history found.</Text>
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
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,

    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,

    elevation: 5,
  },
  text: {
    fontSize: 18,
  },
  result: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },
  date: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
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
  },
});
