# filepath: w:\Coding Projects\AI Photo app project\clip_server.py
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


@app.route("/clip", methods=["POST"])
def clip():
    data = request.json
    image_data = base64.b64decode(data["image"].split(",")[1])
    image = Image.open(BytesIO(image_data))
    texts = data["labels"]

    inputs = processor(text=texts, images=image, return_tensors="pt", padding=True)
    outputs = model(**inputs)
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1).tolist()[0]
    print(f"Labels: {texts}, Probs: {probs}")  # <-- Add this line
    return jsonify(dict(zip(texts, probs)))


if __name__ == "__main__":
    app.run(port=5000)
