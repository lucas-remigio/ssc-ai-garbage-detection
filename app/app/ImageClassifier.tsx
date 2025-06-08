import React, { useState, useEffect } from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as tf from "@tensorflow/tfjs";
import { decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system";
import { useModelLoader } from "./useModelLoader";

export default function ImageClassifier() {
  const { model, loading, error } = useModelLoader();
  const [image, setImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);

  // Class names for your model - dynamically loaded
  const [classNames, setClassNames] = useState<string[]>([
    "paper",
    "plastic",
    "glass",
    "metal",
    "cardboard",
    "trash",
    "battery",
    "e-waste",
    "organic",
    "fabric",
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
      quality: 1,
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

  const classifyImage = async () => {
    if (!model || !image) return;

    try {
      setClassifying(true);

      // Read the image file
      const imgB64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Decode the image
      const imgBuffer = tf.util.encodeString(imgB64, "base64").buffer;
      const raw = new Uint8Array(imgBuffer);
      const imageTensor = decodeJpeg(raw);

      // Preprocess the image
      const processed = tf.image
        .resizeBilinear(imageTensor, [128, 128]) // Use your model's expected input size
        .div(255.0)
        .expandDims(0);

      // Run inference
      const predictions = model.predict(processed) as tf.Tensor;
      const data = await predictions.data();

      // Get the top prediction
      const maxIndex = data.indexOf(Math.max(...Array.from(data)));
      const className = classNames[maxIndex];
      const confidence = data[maxIndex] * 100;

      setPrediction(`${className} (${confidence.toFixed(1)}%)`);

      // Clean up tensors
      imageTensor.dispose();
      processed.dispose();
      predictions.dispose();
    } catch (err) {
      console.error("Classification error:", err);
      setPrediction(`Error: ${(err as Error).message}`);
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
            onPress={classifyImage}
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
