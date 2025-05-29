# detect.py
import sys
import json
import cv2
import numpy as np
from ultralytics import YOLO

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path missing"}))
        sys.exit(1)

    img_path = sys.argv[1]
    model = YOLO("best.pt")

    img = cv2.imread(img_path)
    if img is None:
        print(json.dumps({"error": "Invalid image"}))
        sys.exit(1)

    results = model(img)
    names = model.names
    boxes = []

    for r in results:
        for box, cls in zip(r.boxes.xyxy.cpu().numpy(), r.boxes.cls.cpu().numpy()):
            x1, y1, x2, y2 = map(int, box)
            label = names[int(cls)]
            boxes.append({
                "label": label,
                "box": [x1, y1, x2, y2]
            })

    print(json.dumps({"boxes": boxes}))

if __name__ == "__main__":
    main()
