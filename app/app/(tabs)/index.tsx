import React from "react";
import { StyleSheet, View } from "react-native";
import ImageClassifier from "../ImageClassifier";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Garbage Classifier
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          AI-powered waste classification
        </ThemedText>
      </ThemedView>
      <View style={styles.classifierContainer}>
        <ImageClassifier />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
  },
  classifierContainer: {
    flex: 1,
  },
});
