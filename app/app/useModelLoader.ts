/* eslint-disable */
import "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";
import { useEffect, useState } from "react";

export function useModelLoader() {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
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

        // right after `const loaded = await tf.loadGraphModel(...)`
        console.log(
          "🔍 Model outputs:",
          loaded.outputs.map((o) => o.name + " " + o.shape + " " + o.dtype)
        );
        // e.g. should print: [[1,10]] or [null,10] depending on signature

        console.log("🔍 Signature:", loaded.modelSignature);
        // inputs should list "input_layer_1" with shape [null,128,128,3]
        // outputs should list "output_0" with dtype and shape [null,10]

        setModel(loaded);
      } catch (e) {
        console.error("❌ Failed to load GraphModel:", e);
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { model, loading, error };
}

export default useModelLoader;
