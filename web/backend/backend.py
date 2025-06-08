from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("./class_names.json") as f:
    classes = json.load(f)

model = tf.keras.models.load_model("./vgg16_finetuned_model.keras")

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    img_bytes = await file.read()
    
    # Open and resize image
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    
    # Debug: Print original image statistics
    print(f"Original image size: {img.size}")
    
    # Resize to match exactly what the model expects (224x224 for VGG16 or your custom size)
    img = img.resize((128, 128))  # Try this size first
    
    img_array = np.array(img)              # [0…255]
    print(f"Resized image shape: {img_array.shape}")
    x = np.expand_dims(img_array, 0)       # let model’s Rescaling do /255
    scores = model.predict(x)[0]
    
    # Debug: Print all scores to see distribution
    print(f"Prediction scores: {scores}")
    print(f"Max score: {np.max(scores)} at index {np.argmax(scores)}")
    
    # Get predicted class
    idx = int(np.argmax(scores))

    return {
      "class": classes[idx],
      "confidence": float(scores[idx]),
      "all_scores": scores.tolist()
    }