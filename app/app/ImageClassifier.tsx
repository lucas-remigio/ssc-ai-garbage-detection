import React, { useState, useEffect } from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as tf from "@tensorflow/tfjs";
import { decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system";
import { useModelLoader } from "./useModelLoader";
import * as ImageManipulator from "expo-image-manipulator";
import { classifyImage } from "../utils/classifyImage";
import classNamesFile from "../assets/class_names.json";

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

  // const classifyImage = async () => {
  //   let result = [];

  //   if (!model || !image) return;

  //   try {
  //     setClassifying(true);
  //     console.log("🕒 [classifyImage] Start");

  //     // 1) Resize image BEFORE decoding (much faster - uses native code)
  //     console.time("🕒 resize");
  //     const manipResult = await ImageManipulator.manipulateAsync(
  //       image,
  //       [{ resize: { width: 128, height: 128 } }],
  //       { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
  //     );
  //     console.timeEnd("🕒 resize");

  //     const uri = manipResult.uri ?? image;

  //     console.time("🕒 classification total");
  //     // 1) Read the image file
  //     console.log("📁 Reading image from URI:", uri);
  //     console.time("🕒 read file");
  //     const imgB64 = await FileSystem.readAsStringAsync(uri, {
  //       encoding: FileSystem.EncodingType.Base64,
  //     });
  //     console.timeEnd("🕒 read file");
  //     console.log("📦 Base64 length:", imgB64.length);

  //     // 2) Decode the JPEG
  //     console.time("🕒 decodeJpeg");
  //     const imgBuffer = tf.util.encodeString(imgB64, "base64").buffer;
  //     const raw = new Uint8Array(imgBuffer);
  //     const imageTensor = decodeJpeg(raw);
  //     console.timeEnd("🕒 decodeJpeg");
  //     console.log("📐 Decoded tensor shape:", imageTensor.shape);

  //     // 3) Preprocess
  //     console.time("🕒 preprocess");
  //     const processed = tf.image
  //       .resizeBilinear(imageTensor, [128, 128])
  //       .expandDims(0);
  //     console.timeEnd("🕒 preprocess");
  //     console.log("🔄 Processed tensor shape:", processed.shape);

  //     // 4) Inference
  //     console.log("▶️ Running model.predict…");
  //     console.time("🕒 predict");
  //     const predictions = model.predict(processed) as tf.Tensor;
  //     const data = await predictions.data();
  //     console.timeEnd("🕒 predict");
  //     console.log("✅ Raw output length:", data.length);

  //     // 5) Post-process
  //     const maxIndex = data.indexOf(Math.max(...Array.from(data)));
  //     const className = classNames[maxIndex] ?? "unknown";
  //     const confidence = (data[maxIndex] ?? 0) * 100;
  //     console.log(`🏷️ Result: ${className} (${confidence.toFixed(1)}%)`);

  //     console.log("📊 All scores:", Array.from(data));
  //     console.log(
  //       "🏷️ Picking index:",
  //       maxIndex,
  //       "=> class:",
  //       classNames[maxIndex]
  //     );

  //     // 6) Cleanup
  //     imageTensor.dispose();
  //     processed.dispose();
  //     predictions.dispose();
      
  //     return [true, className, confidence.toFixed(1)]
  //   } catch (err) {
  //     console.error("❌ Classification error:", err);
  //     return [false, (err as Error).message, -1]
  //   } finally {
  //     console.timeEnd("🕒 classification total");
  //   }
  // };

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
