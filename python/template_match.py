import sys
import json
import base64
import numpy as np
import cv2


def decode_image(b64: str) -> np.ndarray:
    data = base64.b64decode(b64)
    arr = np.frombuffer(data, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def template_match(screen_b64: str, template_b64: str, threshold: float) -> dict:
    screen = decode_image(screen_b64)
    template = decode_image(template_b64)

    result = cv2.matchTemplate(screen, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(result)

    if max_val >= threshold:
        h, w = template.shape[:2]
        center_x = max_loc[0] + w // 2
        center_y = max_loc[1] + h // 2
        return {"found": True, "x": center_x, "y": center_y, "confidence": float(max_val)}

    return {"found": False, "x": None, "y": None, "confidence": float(max_val)}


def main():
    payload = json.loads(sys.stdin.read())
    action = payload.get("action")

    if action == "template_match":
        result = template_match(
            payload["screen"],
            payload["template"],
            payload.get("threshold", 0.8)
        )
        print(json.dumps(result))
    else:
        print(json.dumps({"error": f"Unknown action: {action}"}))


if __name__ == "__main__":
    main()
