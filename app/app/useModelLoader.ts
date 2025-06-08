/* eslint-disable */
import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { Alert } from "react-native";

export function useModelLoader() {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        // 1️⃣ initialize TFJS RN backend
        await tf.ready();
        console.log("✅ TensorFlow ready");

        console.log("🔍 Looking for model files...");
        console.log("⏳ Loading model...");

        // For React Native, we need to use require() for bundled assets
        const { bundleResourceIO } = require("@tensorflow/tfjs-react-native");

        // Load model.json
        const modelUrl = require("../assets/model.json");
        console.log("📁 Model data loaded from bundle");

        // Load all weight shards
        const weightShards = [
          require("../assets/group1-shard1of15.bin"),
          require("../assets/group1-shard2of15.bin"),
          require("../assets/group1-shard3of15.bin"),
          require("../assets/group1-shard4of15.bin"),
          require("../assets/group1-shard5of15.bin"),
          require("../assets/group1-shard6of15.bin"),
          require("../assets/group1-shard7of15.bin"),
          require("../assets/group1-shard8of15.bin"),
          require("../assets/group1-shard9of15.bin"),
          require("../assets/group1-shard10of15.bin"),
          require("../assets/group1-shard11of15.bin"),
          require("../assets/group1-shard12of15.bin"),
          require("../assets/group1-shard13of15.bin"),
          require("../assets/group1-shard14of15.bin"),
          require("../assets/group1-shard15of15.bin"),
        ];

        // Load the model using bundleResourceIO
        const loadedModel = await tf.loadGraphModel(
          bundleResourceIO(modelUrl, weightShards)
        );

        console.log("✅ Real model loaded successfully!");
        console.log(
          `📊 Input shape: ${JSON.stringify(loadedModel.inputs[0].shape)}`
        );
        console.log(
          `📊 Output shape: ${JSON.stringify(loadedModel.outputs[0].shape)}`
        );

        setModel(loadedModel);
        Alert.alert("Success", "Real TensorFlow.js model loaded successfully!");
      } catch (err) {
        console.error("❌ Failed to load model:", err);
        setError(err as Error);
        Alert.alert("Error", (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadModel();
  }, []);

  return { model, loading, error };
}

export default useModelLoader;
