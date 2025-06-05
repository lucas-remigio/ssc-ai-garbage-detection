
# Add to your notebook
import tensorflow as tf
import time
import os
import json
from datetime import datetime

print(f"[{datetime.now()}] Starting TFLite conversion process...")
print(f"[{datetime.now()}] TensorFlow version: {tf.__version__}")

# Timing function
def log_time(start_time, message):
    elapsed = time.time() - start_time
    print(f"[{datetime.now()}] {message} - Took {elapsed:.2f} seconds")
    return time.time()

total_start = time.time()
step_start = total_start

print(f"[{datetime.now()}] Step 1: Loading saved Keras model...")
try:
    model = tf.keras.models.load_model("models/garbage_classifier_model.keras")
    step_start = log_time(step_start, "✅ Model loaded successfully")
    print(f"[{datetime.now()}] Model summary:")
    model.summary()
except Exception as e:
    print(f"[{datetime.now()}] ❌ Error loading model: {str(e)}")
    raise

print(f"[{datetime.now()}] Step 2: Getting class names...")
try:
    class_names = train_dataset.class_names
    print(f"[{datetime.now()}] ✅ Found {len(class_names)} classes: {class_names}")
    step_start = log_time(step_start, "Class names retrieved")
except Exception as e:
    print(f"[{datetime.now()}] ❌ Error getting class names: {str(e)}")
    raise

print(f"[{datetime.now()}] Step 3: Setting up TFLite converter...")
try:
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]  # Optimize for size and latency
    print(f"[{datetime.now()}] ✅ Converter configured with optimizations")
    step_start = log_time(step_start, "Converter setup complete")
except Exception as e:
    print(f"[{datetime.now()}] ❌ Error setting up converter: {str(e)}")
    raise

print(f"[{datetime.now()}] Step 4: Converting model to TFLite format (this might take a while)...")
try:
    conversion_start = time.time()
    tflite_model = converter.convert()
    print(f"[{datetime.now()}] ✅ Conversion successful! TFLite model size: {len(tflite_model) / (1024 * 1024):.2f} MB")
    step_start = log_time(conversion_start, "Model conversion")
except Exception as e:
    print(f"[{datetime.now()}] ❌ Error during conversion: {str(e)}")
    raise

print(f"[{datetime.now()}] Step 5: Saving TFLite model to file...")
try:
    with open('garbage_classifier.tflite', 'wb') as f:
        f.write(tflite_model)
    file_size = os.path.getsize('garbage_classifier.tflite') / (1024 * 1024)
    print(f"[{datetime.now()}] ✅ TFLite model saved successfully, file size: {file_size:.2f} MB")
    step_start = log_time(step_start, "TFLite model file save")
except Exception as e:
    print(f"[{datetime.now()}] ❌ Error saving TFLite model: {str(e)}")
    raise

print(f"[{datetime.now()}] Step 6: Saving class names to JSON...")
try:
    with open('class_names.json', 'w') as f:
        json.dump(class_names, f)
    print(f"[{datetime.now()}] ✅ Class names JSON saved")
    step_start = log_time(step_start, "Class names save")
except Exception as e:
    print(f"[{datetime.now()}] ❌ Error saving class names: {str(e)}")
    raise

log_time(total_start, "🎉 Complete TFLite conversion process")
print(f"[{datetime.now()}] Model and class names ready for mobile app deployment")
