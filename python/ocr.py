import sys
import json
import base64
import numpy as np
import cv2


def decode_image(b64: str) -> np.ndarray:
    data = base64.b64decode(b64)
    arr = np.frombuffer(data, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def ocr_read(image_b64: str, region: dict | None) -> dict:
    try:
        import pytesseract
    except ImportError:
        return {"error": "pytesseract not installed. Run: pip install pytesseract"}

    img = decode_image(image_b64)

    if region:
        x, y, w, h = region["x"], region["y"], region["w"], region["h"]
        img = img[y:y+h, x:x+w]

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    text = pytesseract.image_to_string(gray, lang="kor+eng").strip()
    return {"text": text}


def main():
    payload = json.loads(sys.stdin.read())
    action = payload.get("action")

    if action == "ocr":
        result = ocr_read(payload["image"], payload.get("region"))
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(json.dumps({"error": f"Unknown action: {action}"}))


if __name__ == "__main__":
    main()
