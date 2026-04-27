import base64
import io
import os
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

app = FastAPI(title="Pothole Detection API")

frontend_origins = os.getenv("FRONTEND_ORIGINS", "*")
if frontend_origins.strip() == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.getenv("MODEL_PATH", "YOLOv11s_Pothole_Trained.pt")
model: YOLO | None = None


def get_model() -> YOLO:
    global model

    if model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"YOLO weights not found at {MODEL_PATH}. Set MODEL_PATH to a valid .pt file."
            )

        model = YOLO(MODEL_PATH)

    return model


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def classify_confidence(confidence: float) -> tuple[str, tuple[int, int, int]]:
    if confidence < 0.50:
        return "Minor", (0, 255, 0)
    if confidence < 0.75:
        return "Medium", (0, 255, 255)
    return "Major", (0, 0, 255)


def annotate_frame(frame: np.ndarray, results: Any) -> tuple[np.ndarray, list[dict[str, Any]]]:
    annotated = frame.copy()
    detections: list[dict[str, Any]] = []

    for box in results[0].boxes:
        confidence = float(box.conf[0])
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        severity, color = classify_confidence(confidence)

        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        cv2.putText(
            annotated,
            severity,
            (x1, max(y1 - 5, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2,
        )

        detections.append(
            {
                "severity": severity,
                "confidence": round(confidence, 4),
                "bbox": [x1, y1, x2, y2],
            }
        )

    return annotated, detections


@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)) -> dict[str, Any]:
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_np = np.array(img)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file") from exc

    try:
        predictor = get_model()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    results = predictor.predict(img_np, conf=0.25)
    annotated, detections = annotate_frame(img_np, results)

    success, buffer = cv2.imencode(".jpg", annotated)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode annotated image")

    encoded_image = base64.b64encode(buffer.tobytes()).decode("utf-8")

    return {
        "filename": file.filename,
        "detections": detections,
        "annotated_image": f"data:image/jpeg;base64,{encoded_image}",
        "count": len(detections),
    }
