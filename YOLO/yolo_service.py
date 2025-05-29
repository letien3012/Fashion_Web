from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from ultralytics import YOLO
import numpy as np
import cv2
import base64
import json  # cần import json để parse chuỗi JSON

app = FastAPI()
model = YOLO("best.pt")

def decode_image(contents: bytes):
    np_img = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    return img

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = decode_image(contents)
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
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/crop")
async def crop(file: UploadFile = File(...), boxes: str = Form(...)):
    try:
        contents = await file.read()
        img = decode_image(contents)

        boxes_data = json.loads(boxes)  # parse chuỗi JSON thành list/dict
        crops = []

        for item in boxes_data:
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
        raise HTTPException(status_code=400, detail=str(e))
