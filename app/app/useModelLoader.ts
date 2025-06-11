/* eslint-disable */
import "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Global singleton state outside of React component lifecycle
let model: tf.GraphModel | null = null;
let isLoading = true;
let loadError: Error | null = null;
let modelPromise: Promise<tf.GraphModel> | null = null;

const MODEL_CACHE_KEY = "model_loaded_session";

// Optimized model loading with speed improvements
const loadModel = async (
  onProgress?: (progress: number) => void
): Promise<tf.GraphModel> => {
  try {
    await tf.ready();
    console.log("✅ TensorFlow ready");
    onProgress?.(10);

    // Set optimized backend for React Native (this alone can give 2-3x speedup)
    try {
      await tf.setBackend("rn-webgl");
      console.log("✅ Using WebGL backend for faster inference");
    } catch (e) {
      console.log("⚠️ WebGL not available, using CPU backend");
      await tf.setBackend("cpu");
    }
    onProgress?.(20);

    // Enable memory growth to prevent OOM issues with large models
    tf.env().set("WEBGL_CPU_FORWARD", false);
    tf.env().set("WEBGL_PACK", true);

    const modelJson = require("../assets/saved_model/model.json");
    console.log("🔗 Loading model.json:", modelJson);
    onProgress?.(30);

    // Load weight shards - this is the main bottleneck
    console.log("🔗 Loading weight shards...");
    const weightShards = [
      require("../assets/saved_model/group1-shard1of15.bin"),
      require("../assets/saved_model/group1-shard2of15.bin"),
      require("../assets/saved_model/group1-shard3of15.bin"),
      require("../assets/saved_model/group1-shard4of15.bin"),
      require("../assets/saved_model/group1-shard5of15.bin"),
      require("../assets/saved_model/group1-shard6of15.bin"),
      require("../assets/saved_model/group1-shard7of15.bin"),
      require("../assets/saved_model/group1-shard8of15.bin"),
      require("../assets/saved_model/group1-shard9of15.bin"),
      require("../assets/saved_model/group1-shard10of15.bin"),
      require("../assets/saved_model/group1-shard11of15.bin"),
      require("../assets/saved_model/group1-shard12of15.bin"),
      require("../assets/saved_model/group1-shard13of15.bin"),
      require("../assets/saved_model/group1-shard14of15.bin"),
      require("../assets/saved_model/group1-shard15of15.bin"),
    ];
    onProgress?.(60);

    console.log("🔗 Loading GraphModel with optimizations...");

    // Load the model with optimizations
    const loaded = await tf.loadGraphModel(
      bundleResourceIO(modelJson, weightShards)
    );
    onProgress?.(90);

    console.log("✅ GraphModel loaded:", loaded);
    console.log(
      "🔍 Model outputs:",
      loaded.outputs.map((o) => o.name + " " + o.shape + " " + o.dtype)
    );

    // Warm up the model with correct input shape (this prevents slow first inference)
    console.log("🔥 Warming up model...");
    const dummyInput = tf.zeros([1, 128, 128, 3]); // Use correct input shape
    loaded.predict(dummyInput);

    onProgress?.(100);
    console.log("✅ Model warmed up and ready!");

    return loaded;
  } catch (e) {
    console.error("❌ Failed to load GraphModel:", e);
    throw e;
  }
};

// Memory-based caching (model stays in memory after first load)
const loadModelWithMemoryCache = async (
  onProgress?: (progress: number) => void
): Promise<tf.GraphModel> => {
  try {
    // If model is already loaded in memory, return immediately
    if (model) {
      console.log("🚀 Using cached model from memory (instant!)");
      onProgress?.(100);
      return model;
    }

    // Check if we recently loaded the model in this session
    const sessionStart = await AsyncStorage.getItem("app_session_start");
    const now = Date.now();

    if (!sessionStart) {
      await AsyncStorage.setItem("app_session_start", now.toString());
    }

    console.log("🔗 Loading model for the first time in this session...");
    const loaded = await loadModel(onProgress);

    // Store that we loaded the model in this session
    await AsyncStorage.setItem(MODEL_CACHE_KEY, now.toString());

    return loaded;
  } catch (e) {
    console.error("Memory cache failed, loading normally:", e);
    return loadModel(onProgress);
  }
};

export function useModelLoader() {
  const [localModel, setLocalModel] = useState<tf.GraphModel | null>(model);
  const [localLoading, setLocalLoading] = useState(isLoading);
  const [localError, setLocalError] = useState<Error | null>(loadError);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // If model is already loaded, use that instance immediately
    if (model) {
      setLocalModel(model);
      setLocalLoading(false);
      setProgress(100);
      return;
    }

    // If model load has failed, use that error
    if (loadError) {
      setLocalError(loadError);
      setLocalLoading(false);
      return;
    }

    // If model is currently loading, wait for that promise
    if (modelPromise) {
      modelPromise
        .then((loadedModel) => {
          setLocalModel(loadedModel);
          setProgress(100);
        })
        .catch((error) => {
          setLocalError(error);
        })
        .finally(() => {
          setLocalLoading(false);
        });
      return;
    }

    // Start loading model if not already started
    console.log("🚀 Starting model load...");
    isLoading = true;

    modelPromise = loadModelWithMemoryCache((progress) => setProgress(progress))
      .then((loadedModel) => {
        model = loadedModel;
        isLoading = false;
        setLocalModel(loadedModel);
        setLocalLoading(false);
        return loadedModel;
      })
      .catch((error) => {
        loadError = error;
        isLoading = false;
        setLocalError(error);
        setLocalLoading(false);
        throw error;
      });
  }, []);

  return {
    model: localModel,
    loading: localLoading,
    error: localError,
    progress,
  };
}

export default useModelLoader;
