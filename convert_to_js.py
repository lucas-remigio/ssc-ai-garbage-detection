import tensorflow as tf
import tensorflowjs as tfjs
import os

print(f"TensorFlow version: {tf.__version__}")
print(f"TensorFlow.js version: {tfjs.__version__}")

# Load the Keras model
print("Loading model...")
model = tf.keras.models.load_model("vgg16_finetuned_model.keras")
print(f"Model loaded successfully. Input shape: {model.input_shape}, Output shape: {model.output_shape}")

# Create output directory
output_dir = "./app/assets/model"
os.makedirs(output_dir, exist_ok=True)

# Convert and save using the tfjs module directly
print(f"Converting model to TensorFlow.js format...")
tfjs.converters.save_keras_model(model, output_dir)
print(f"Model converted and saved to {output_dir}")