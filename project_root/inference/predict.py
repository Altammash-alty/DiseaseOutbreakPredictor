import torch
import torch.nn as nn
import numpy as np
import yaml
import json
import os
from project_root.pipeline.data_preprocessing import DataProcessor
from project_root.models.outbreak_predictor import OutbreakPredictor

# Load configuration
with open("project_root/configs/model_config.yaml", "r") as f:
    config = yaml.safe_load(f)

# Global model variable for persistence
MODEL = None
PROCESSOR = DataProcessor(model_name=config['model_params']['bert_model_name'])
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    global MODEL
    if MODEL is None:
        save_path = config['paths']['model_save_dir']
        model_file = os.path.join(save_path, "model.pth")
        
        MODEL = OutbreakPredictor(config)
        
        if os.path.exists(model_file):
            try:
                state_dict = torch.load(model_file, map_location=DEVICE)
                MODEL.load_state_dict(state_dict)
                print("Model weights loaded successfully.")
            except Exception as e:
                print(f"Error loading weights: {e}")
        else:
            print("Model weights not found. Using initialized model.")
            
        MODEL.to(DEVICE)
        MODEL.eval()
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
    # Pharmacy features for temporal LSTM
    pharmacy_features = np.array(data.get("pharmacy_features", [0]*config['model_params']['lstm_input_dim'])).astype(np.float32)
    
    # Mocking a temporal window (batch, time_steps, features)
    temporal_input = np.tile(pharmacy_features, (1, config['model_params']['temporal_window'], 1))
    temporal_input = torch.tensor(temporal_input).to(DEVICE)
    
    # Prepare Graph Data (Spatial)
    x_gnn, edge_index = PROCESSOR.build_graph_data(num_regions=config['model_params']['num_regions'])
    x_gnn = x_gnn.to(DEVICE)
    edge_index = edge_index.to(DEVICE)
    
    # 3. Model Inference
    with torch.no_grad():
        prediction = model(temporal_input, x_gnn, edge_index)
        probability = float(prediction[0][0].item())
    
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
        "pharmacy_features": [120, 34, 20, 45, 90, 10], # Match lstm_input_dim
        "region_id": 4,
        "date_index": 180
    }
    result = predict_outbreak(test_input)
    print(json.dumps(result, indent=4))
