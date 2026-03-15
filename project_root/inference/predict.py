import tensorflow as tf
import numpy as np
import yaml
import json
from project_root.pipeline.data_preprocessing import DataProcessor

# Load configuration
with open("project_root/configs/model_config.yaml", "r") as f:
    config = yaml.safe_load(f)

# Global model variable for persistence
MODEL = None
PROCESSOR = DataProcessor(model_name=config['model_params']['bert_model_name'])

def load_model():
    global MODEL
    if MODEL is None:
        path = config['paths']['model_save_dir']
        try:
            MODEL = tf.keras.models.load_model(path)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            # For demonstration, we'll initialize a new one if not found
            from project_root.models.outbreak_predictor import OutbreakPredictor
            MODEL = OutbreakPredictor(config)
    return MODEL

def predict_outbreak(input_json):
    """
    Main inference entry point.
    Input: JSON with search_queries, social_posts, pharmacy_features, etc.
    Returns: Probability and Risk Level.
    """
    model = load_model()
    
    # 1. Parse Input
    if isinstance(input_json, str):
        data = json.loads(input_json)
    else:
        data = input_json

    # 2. Extract and Prepare Features
    # Text processing (BERT) - usually pre-processed or handled by a text vectorizer layer
    # For this prediction, we focus on the temporal and spatial fusion
    
    # Prepare temporal features (pharmacy data)
    # In production, FastAPI would provide the last N days of data
    pharmacy_features = np.array(data.get("pharmacy_features", [0]*5)).astype(np.float32)
    # Mocking a temporal window (batch, time_steps, features)
    # Here we simulate that the input contains the current timestamp's features
    # and we pad/mock the history for the LSTM
    temporal_input = np.tile(pharmacy_features, (1, config['model_params']['temporal_window'], 1))
    
    # Prepare Graph (Spatial)
    graph = PROCESSOR.build_graph_tensor(num_regions=config['model_params']['num_regions'])
    
    # 3. Model Inference
    # We repeat graph for the batch size 1
    prediction = model.predict([temporal_input, graph])
    probability = float(prediction[0][0])
    
    # 4. Determine Risk Level
    risk_level = "LOW"
    if probability > 0.7:
        risk_level = "HIGH"
    elif probability > 0.4:
        risk_level = "MEDIUM"
        
    return {
        "outbreak_probability": round(probability, 4),
        "risk_level": risk_level,
        "region_id": data.get("region_id"),
        "timestamp": data.get("date_index")
    }

if __name__ == "__main__":
    # Test sample
    test_input = {
        "search_queries": ["fever symptoms", "body pain"],
        "social_posts": ["Everyone is sick today"],
        "pharmacy_features": [120, 34, 20, 45, 90],
        "region_id": 4,
        "date_index": 180
    }
    result = predict_outbreak(test_input)
    print(json.dumps(result, indent=4))
