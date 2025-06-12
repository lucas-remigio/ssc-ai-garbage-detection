import React, { useState, useEffect } from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useModelLoader } from "./useModelLoader";
import { classifyImage } from "../utils/classifyImage";

export default function ImageClassifier() {
  const { model, loading, error } = useModelLoader();
  const [image, setImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);

  // Class names for your model - dynamically loaded
  const [classNames, setClassNames] = useState<string[]>([
    "battery",
    "biological",
    "cardboard",
    "clothes",
    "glass",
    "metal",
    "paper",
    "plastic",
    "shoes",
    "trash",
  ]);

  // Load class names from JSON file
  useEffect(() => {
    const loadClassNames = async () => {
      try {
        const classNamesFile = require("../assets/class_names.json");
        console.log("Loaded class names:", classNamesFile);
        setClassNames(classNamesFile);
      } catch (error) {
        console.error("Error loading class names:", error);
        // Keep the default class names if loading fails
      }
    };
    loadClassNames();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1, // Lower quality if needed
      exif: false, // Don't need metadata
      base64: false, // Don't get base64 data
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null);
    }
  };

  const printClassification = async () => {
    if (!model || !image) {
      setPrediction("Error: Model or image not loaded");
      return;
    }
    setClassifying(true);
    try {
      const result = await classifyImage({
        model,
        image,
        classNames,
      });
      if (!result) {
        setPrediction("Error: No result");
        return;
      }
      const [success, message, confidence] = result;
      if (success) {
        setPrediction(`${message} (${confidence})`);
      } else {
        setPrediction(`Error: ${message}`);
      }
    } finally {
      setClassifying(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Garbage Classifier</Text>

      {loading && <Text style={styles.loadingText}>Loading model...</Text>}
      {error && <Text style={styles.error}>Error: {error.message}</Text>}

      <View style={styles.buttonContainer}>
        <Button
          title="Pick from Gallery"
          onPress={pickImage}
          disabled={loading}
        />
        <Button title="Take Photo" onPress={takePhoto} disabled={loading} />
      </View>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <Button
            title={classifying ? "Classifying..." : "Classify"}
            onPress={printClassification}
            disabled={loading || classifying || !model}
          />
        </View>
      )}

      {prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>{prediction}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 10,
    borderRadius: 10,
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  result: {
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});
