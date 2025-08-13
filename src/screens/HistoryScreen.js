import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons"; // <-- add this at the top


export default function HistoryScreen() {
  const { colors } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    // Real-time listener (newest first)
    const q = query(
      collection(db, "users", user.uid, "history"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            ...raw,
          };
        });
        setHistory(data);
        setLoading(false);
        setRefreshing(false);
      },
      (err) => {
        console.warn("Error fetching history:", err.message);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsub();
  }, [db, auth]);

  const onRefresh = useCallback(() => {
    // Because we’re using onSnapshot, there’s nothing to manually refetch.
    // This just shows the spinner briefly.
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const confirmDelete = (item) => {
    Alert.alert(
      "Delete entry",
      "Are you sure you want to delete this history item?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDelete(item) },
      ]
    );
  };

  const handleDelete = async (item) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setDeletingIds((prev) => new Set(prev).add(item.id));
      await deleteDoc(doc(db, "users", user.uid, "history", item.id));
      // No need to manually update state; onSnapshot will fire.
    } catch (e) {
      console.warn("Failed to delete history item:", e?.message);
      Alert.alert("Delete failed", "Please try again.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const renderItem = ({ item }) => {
    const isDeleting = deletingIds.has(item.id);

    // createdAt may be a Firestore Timestamp or undefined if just added locally
    const dateLabel =
      item?.createdAt?.toDate
        ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })
        : item?.createdAtLocal
        ? formatDistanceToNow(new Date(item.createdAtLocal), { addSuffix: true })
        : "Just now";

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowColor: colors.text },
        ]}
      >
        {/* Header row: conversion text + delete button */}
        <View style={styles.row}>
          <Text style={[styles.text, { color: colors.text, flex: 1 }]}>
            {item.amount} {item.from} → {item.to}
          </Text>

         <TouchableOpacity
  onPress={() => confirmDelete(item)}
  disabled={isDeleting}
  style={[
    styles.deleteBtn,
    {
      borderColor: colors.border,
      opacity: isDeleting ? 0.6 : 1,
    },
  ]}
>
  {isDeleting ? (
    <ActivityIndicator size="small" color={colors.primary} />
  ) : (
    <MaterialIcons name="delete-outline" size={22} color={colors.text} />
  )}
</TouchableOpacity>

        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.result, { color: colors.primary }]}>
          = {item.result} {item.to}
        </Text>

        <Text style={[styles.date, { color: colors.text }]}>{dateLabel}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Exchange History</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No exchange history found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
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
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteTxt: {
    fontSize: 16,
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
