"""
Moodverse Deep Learning Flask REST API
Runs TensorFlow Deep CNN for real-time facial emotion recognition,
visual semantic embeddings, and neural sequence forecasting.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from dl_models import FacialEmotionDeepCNN, DeepVisualEmbeddingModel, DeepSequenceForecaster

app = Flask(__name__)
# Enable CORS for the frontend Vite development server (localhost:5173) and any origin
CORS(app, resources={r"/api/*": {"origins": "*"}})

print("Initializing Moodverse Deep Learning Models...")
emotion_cnn = FacialEmotionDeepCNN()
visual_embedder = DeepVisualEmbeddingModel()
sequence_forecaster = DeepSequenceForecaster()
print("[OK] Deep Learning Models successfully loaded into memory.")


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "online",
        "engine": "TensorFlow Deep Learning Backend",
        "tf_version": tf.__version__,
        "devices": [d.name for d in tf.config.list_physical_devices()],
        "models": [
            "FacialEmotionDeepCNN (64x64 Conv2D Residual FER)",
            "DeepVisualEmbeddingModel (64-dim Latent Ontology)",
            "DeepSequenceForecaster (Recurrent Burnout Predictor)"
        ]
    })


@app.route('/api/predict-emotion', methods=['POST'])
def predict_emotion():
    """
    Receives base64 camera image, runs through Deep CNN, returns emotion biometrics
    """
    try:
        data = request.get_json(force=True)
        image_b64 = data.get('image', None)
        if not image_b64:
            return jsonify({"error": "No image provided in request body"}), 400

        result = emotion_cnn.predict(image_b64)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/extract-visual-embedding', methods=['POST'])
def extract_visual_embedding():
    """
    Extracts deep 64-dimensional semantic embedding for artwork
    """
    try:
        data = request.get_json(force=True)
        image_b64 = data.get('image', None)
        if not image_b64:
            return jsonify({"error": "No image provided"}), 400

        embedding = visual_embedder.extract_embedding(image_b64)
        return jsonify({"embedding": embedding, "dimensions": len(embedding)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/forecast-difficult-days', methods=['POST'])
def forecast_difficult_days():
    """
    Runs Deep Sequence Forecaster over user's past emotional trajectory
    """
    try:
        data = request.get_json(force=True) or {}
        entries = data.get('entries', [])
        result = sequence_forecaster.predict_forecast(entries)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("[START] Moodverse Deep Learning Backend starting on http://127.0.0.1:5000 ...")
    app.run(host='0.0.0.0', port=5000, debug=False)
