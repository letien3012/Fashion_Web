from fastapi import FastAPI, HTTPException, Body
from ultralytics import YOLO
import numpy as np
import cv2
import base64
import json
import torch
import requests
import logging
import os
from torchvision import transforms
from efficientnet_pytorch import EfficientNet
from typing import List, Dict, Any
from urllib.parse import urlparse
from sentence_transformers import SentenceTransformer

# Cấu hình logging
logging.basicConfig(
    filename='yolo_service.log',
    level=logging.ERROR,  # Chỉ log lỗi
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = FastAPI()
model = YOLO("best.pt")
# Load EfficientNet-B0 model
efficientnet_model = EfficientNet.from_pretrained('efficientnet-b0')
efficientnet_model.eval()  # Set to evaluation mode

# Load Sentence-BERT model
bert_model = SentenceTransformer("./bge-m3")


# Define image preprocessing
preprocess = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def download_image(image_path: str):
    try:
        # Check if it's a URL
        if image_path.startswith(('http://', 'https://')):
            response = requests.get(image_path)
            response.raise_for_status()
            np_img = np.frombuffer(response.content, np.uint8)
            img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        else:
            # Handle local file path
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image file not found: {image_path}")
            img = cv2.imread(image_path)
            
        if img is None:
            raise ValueError("Could not decode image")
            
        return img
    except Exception as e:
        logging.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@app.post("/detect")
async def detect(data: Dict[str, str] = Body(...)):
    try:
        image_url = data.get("image_url")
        if not image_url:
            raise HTTPException(status_code=400, detail="image_url is required")
            
        img = download_image(image_url)
        results = model(img)
        boxes = []
        names = model.names

        for r in results:
            for box, cls in zip(r.boxes.xyxy.cpu().numpy(), r.boxes.cls.cpu().numpy()):
                x1, y1, x2, y2 = map(int, box)
                label = names[int(cls)]
                boxes.append({
                    "x": x1,
                    "y": y1,
                    "width": x2 - x1,
                    "height": y2 - y1,
                    "label": label
                })
        return {"boxes": boxes}
    except Exception as e:
        logging.error(f"Error in detect endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/crop")
async def crop(data: Dict[str, Any] = Body(...)):
    try:
        image_url = data.get("image_url")
        boxes = data.get("boxes")
        
        if not image_url:
            raise HTTPException(status_code=400, detail="image_url is required")
        if not boxes or not isinstance(boxes, list):
            raise HTTPException(status_code=400, detail="boxes must be a list")
            
        img = download_image(image_url)
        crops = []

        for item in boxes:
            if not isinstance(item, dict) or "box" not in item:
                continue
                
            x1, y1, x2, y2 = item["box"]
            label = item.get("label", "object")
            crop_img = img[y1:y2, x1:x2]

            _, buffer = cv2.imencode('.jpg', crop_img)
            crop_base64 = base64.b64encode(buffer).decode('utf-8')

            crops.append({
                "label": label,
                "box": [x1, y1, x2, y2],
                "image_base64": crop_base64
            })
        
        return {"crops": crops}
    except Exception as e:
        logging.error(f"Error in crop endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

def is_valid_url(url: str) -> bool:
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def decode_base64_image(base64_string: str):
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_string)
        np_img = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Could not decode base64 image")
            
        return img
    except Exception as e:
        logging.error(f"Error decoding base64 image: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error decoding base64 image: {str(e)}")

@app.post("/extract-features")
async def extract_features(data: Dict[str, str] = Body(...)):
    try:
        image_data = data.get("image_url")
        if not image_data:
            raise HTTPException(status_code=400, detail="image_url is required")
            
        # Xử lý base64
        if image_data.startswith('data:image') or ',' in image_data:
            img = decode_base64_image(image_data)
        else:
            # Xử lý URL hoặc file local
            img = download_image(image_data)
        
        # Convert BGR to RGB (EfficientNet expects RGB)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Preprocess image
        input_tensor = preprocess(img_rgb)
        input_batch = input_tensor.unsqueeze(0)  # Add batch dimension
        
        # Extract features
        with torch.no_grad():
            features = efficientnet_model.extract_features(input_batch)
            # Get the final features (global average pooling)
            features = torch.mean(features, dim=[2, 3])  # Global average pooling
            features = features.squeeze().numpy()  # Convert to numpy array
            
        return {"features": features.tolist()}
    except requests.exceptions.RequestException as e:
        logging.error(f"Network error in extract-features endpoint: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error downloading image: {str(e)}")
    except FileNotFoundError as e:
        logging.error(f"File not found error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error in extract-features endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/vectorize-text")
async def vectorize_text(data: Dict[str, str] = Body(...)):
    try:
        text = data.get("text")
        if not text:
            raise HTTPException(status_code=400, detail="text is required")
            
        # Vectorize the text
        embedding = bert_model.encode(text)
        
        return {"embedding": embedding.tolist()}
    except Exception as e:
        logging.error(f"Error in vectorize-text endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
