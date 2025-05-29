# crop.py
import sys
import json
import cv2
import base64

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Image path and boxes JSON are required"}))
        sys.exit(1)

    img_path = sys.argv[1]
    boxes_json = sys.argv[2]

    try:
        boxes = json.loads(boxes_json)
    except:
        print(json.dumps({"error": "Invalid boxes JSON"}))
        sys.exit(1)

    img = cv2.imread(img_path)
    if img is None:
        print(json.dumps({"error": "Invalid image"}))
        sys.exit(1)

    crops = []
    for box_info in boxes:
        label = box_info.get("label")
        x1, y1, x2, y2 = box_info.get("box")
        crop_img = img[y1:y2, x1:x2]
        _, buffer = cv2.imencode(".jpg", crop_img)
        crop_base64 = base64.b64encode(buffer).decode("utf-8")
        crops.append({
            "label": label,
            "box": [x1, y1, x2, y2],
            "image": crop_base64
        })

    print(json.dumps({"crops": crops}))

if __name__ == "__main__":
    main()
