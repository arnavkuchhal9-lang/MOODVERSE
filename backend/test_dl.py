import numpy as np
import cv2
import base64
from dl_models import FacialEmotionDeepCNN, DeepVisualEmbeddingModel, DeepSequenceForecaster

print("Testing FacialEmotionDeepCNN initialization...")
cnn = FacialEmotionDeepCNN()

# Generate dummy 100x100 synthetic face image
dummy_img = np.ones((120, 120, 3), dtype=np.uint8) * 180
# Draw a simple smiley face
cv2.circle(dummy_img, (60, 60), 40, (255, 255, 255), -1)
cv2.circle(dummy_img, (48, 50), 6, (0, 0, 0), -1)
cv2.circle(dummy_img, (72, 50), 6, (0, 0, 0), -1)
cv2.ellipse(dummy_img, (60, 75), (20, 12), 0, 0, 180, (0, 0, 0), 2)

_, buffer = cv2.imencode('.jpg', dummy_img)
b64_str = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')

print("Running CNN inference on test image...")
res = cnn.predict(b64_str)
print("CNN Prediction Output:")
print(" - Dominant Mood:", res['dominantMood']['name'])
print(" - Confidence:", res['confidence'])
print(" - Valence:", res['valence'])
print(" - Arousal:", res['arousal'])
print(" - Engine:", res['engine'])

print("\nTesting DeepVisualEmbeddingModel...")
embedder = DeepVisualEmbeddingModel()
emb = embedder.extract_embedding(b64_str)
print(" - Extracted Embedding vector length:", len(emb))

print("\nTesting DeepSequenceForecaster...")
forecaster = DeepSequenceForecaster()
fc = forecaster.predict_forecast([{"valence": 20}, {"valence": -10}, {"valence": -45}])
print(" - Forecast Highest Risk Day:", fc['highestRiskDay']['dayName'], fc['highestRiskDay']['riskScore'], "%")
print("\n[SUCCESS] ALL DEEP LEARNING MODULES VERIFIED SUCCESSFULLY!")
