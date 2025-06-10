import * as tf from "@tensorflow/tfjs";
import { decodeJpeg } from "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export async function classifyImage({
  model,
  image,
  classNames,
}: {
  model: tf.GraphModel;
  image: string;
  classNames: string[];
}): Promise<[boolean, string, string]> {
  try {
    console.log("🕒 [classifyImage] Start");

    // 1) Resize image BEFORE decoding (much faster - uses native code)
    console.time("🕒 resize");
    const manipResult = await ImageManipulator.manipulateAsync(image, [
      { resize: { width: 128, height: 128 } },
    ]);
    console.log("📏 Resized image to 128x128, uri: " + manipResult.uri);
    console.timeEnd("🕒 resize");

    const uri = manipResult.uri ?? image;

    console.time("🕒 classification total");
    // 1) Read the image file
    console.log("📁 Reading image from URI:", uri);
    console.time("🕒 read file");
    const imgB64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.timeEnd("🕒 read file");
    console.log("📦 Base64 length:", imgB64.length);

    // 2) Decode the JPEG
    console.time("🕒 decodeJpeg");
    const imgBuffer = tf.util.encodeString(imgB64, "base64").buffer;
    const raw = new Uint8Array(imgBuffer);
    const imageTensor = decodeJpeg(raw);
    console.timeEnd("🕒 decodeJpeg");
    console.log("📐 Decoded tensor shape:", imageTensor.shape);

    // 3) Preprocess
    console.time("🕒 preprocess");
    const processed = tf.image
      .resizeBilinear(imageTensor, [128, 128])
      .expandDims(0);
    console.timeEnd("🕒 preprocess");
    console.log("🔄 Processed tensor shape:", processed.shape);

    // 4) Inference
    console.log("▶️ Running model.predict…");
    console.time("🕒 predict");
    const predictions = model.predict(processed) as tf.Tensor;
    const data = await predictions.data();
    console.timeEnd("🕒 predict");
    console.log("✅ Raw output length:", data.length);

    // 5) Post-process
    const maxIndex = data.indexOf(Math.max(...Array.from(data)));
    const className = classNames[maxIndex] ?? "unknown";
    const confidence = (data[maxIndex] ?? 0) * 100;
    console.log(`🏷️ Result: ${className} (${confidence.toFixed(1)}%)`);

    console.log("📊 All scores:", Array.from(data));
    console.log(
      "🏷️ Picking index:",
      maxIndex,
      "=> class:",
      classNames[maxIndex]
    );

    // 6) Cleanup
    imageTensor.dispose();
    processed.dispose();
    predictions.dispose();

    return [true, className, confidence.toFixed(1)];
  } catch (err) {
    console.error("❌ Classification error:", err);
    return [false, (err as Error).message, "-1"];
  } finally {
    console.timeEnd("🕒 classification total");
  }
}
