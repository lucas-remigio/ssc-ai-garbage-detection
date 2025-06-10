/* eslint-disable */
import "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";
import { useEffect, useState } from "react";

// Global singleton state outside of React component lifecycle
let model: tf.GraphModel | null = null;
let isLoading = true;
let loadError: Error | null = null;
let modelPromise: Promise<tf.GraphModel> | null = null;

// Function to load the model (only called once)
const loadModel = async (): Promise<tf.GraphModel> => {
  try {
    await tf.ready();
    console.log("✅ TensorFlow ready");

    // 1) require the GraphModel spec & shards from your assets/model folder
    const modelJson = require("../assets/saved_model/model.json");

    console.log("🔗 Loading model.json:", modelJson);

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

    console.log("🔗 Weight shards:", weightShards);
    console.log("🔗 Loading GraphModel…");

    // 2) load as GraphModel
    const loaded = await tf.loadGraphModel(
      bundleResourceIO(modelJson, weightShards)
    );

    console.log("✅ GraphModel loaded:", loaded);
    console.log(
      "🔍 Model outputs:",
      loaded.outputs.map((o) => o.name + " " + o.shape + " " + o.dtype)
    );
    console.log("🔍 Signature:", loaded.modelSignature);

    return loaded;
  } catch (e) {
    console.error("❌ Failed to load GraphModel:", e);
    throw e;
  }
};

export function useModelLoader() {
  // Local state to trigger component re-render
  const [localModel, setLocalModel] = useState<tf.GraphModel | null>(model);
  const [localLoading, setLocalLoading] = useState(isLoading);
  const [localError, setLocalError] = useState<Error | null>(loadError);

  useEffect(() => {
    // If model is already loaded or loading, use that instance
    if (model) {
      setLocalModel(model);
      setLocalLoading(false);
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
    isLoading = true;
    modelPromise = loadModel()
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
  };
}

export default useModelLoader;
