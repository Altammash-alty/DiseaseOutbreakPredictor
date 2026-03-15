import torch
import torch.nn as nn
import numpy as np
import yaml
import json
import os
import pandas as pd
from project_root.pipeline.data_preprocessing import DataProcessor
from project_root.models.outbreak_predictor import OutbreakPredictor

# Load configuration
config_path = "project_root/configs/model_config.yaml"
if not os.path.exists(config_path):
    config_path = os.path.join(os.path.dirname(__file__), "..", "configs", "model_config.yaml")

with open(config_path, "r") as f:
    config = yaml.safe_load(f)

# Global model variable for persistence
MODEL = None
PROCESSOR = DataProcessor(model_name=config['model_params']['bert_model_name'])
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    global MODEL
    if MODEL is None:
        save_path = config['paths']['model_save_dir']
        # Handle relative pathing
        if not os.path.isabs(save_path):
            save_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", save_path))
            
        model_file = os.path.join(save_path, "model.pth")
        
        MODEL = OutbreakPredictor(config)
        
        if os.path.exists(model_file):
            try:
                state_dict = torch.load(model_file, map_location=DEVICE)
                MODEL.load_state_dict(state_dict)
                print(f"Model weights loaded from {model_file}")
            except Exception as e:
                print(f"Error loading weights: {e}")
        else:
            print(f"Model weights not found at {model_file}. Using initialized model.")
            
        MODEL.to(DEVICE)
        MODEL.eval()
    return MODEL

def get_latest_city_features(city_name):
    """
    Fetches the latest pharmacy features for a city from the real data CSV.
    """
    real_data_path = config['paths'].get('real_data', "project_root/data/real_pharmacy_data.csv")
    if not os.path.isabs(real_data_path):
         real_data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", real_data_path))

    if os.path.exists(real_data_path):
        df = pd.read_csv(real_data_path)
        city_data = df[df['city'] == city_name]
        if not city_data.empty:
            # Get latest entry (assuming chronological order or date_index)
            latest = city_data.sort_values('date_index', ascending=False).iloc[0]
            feature_cols = config['model_params']['pharmacy_feature_cols']
            return latest[feature_cols].values.tolist(), int(latest['region_id']), int(latest['date_index'])
    
    # Defaults if not found
    return [0]*config['model_params']['lstm_input_dim'], 0, 0

def predict_outbreak(input_data):
    """
    Main inference entry point.
    Input: Can be a city name (str) or a dict with features.
    """
    model = load_model()
    
    # 1. Prepare Input Data
    if isinstance(input_data, str):
        # Treat as city name
        pharmacy_features, region_id, date_index = get_latest_city_features(input_data)
        data = {
            "pharmacy_features": pharmacy_features,
            "region_id": region_id,
            "date_index": date_index
        }
    else:
        data = input_data
    
    # 2. Extract and Prepare Features
    pharmacy_features = np.array(data.get("pharmacy_features", [0]*config['model_params']['lstm_input_dim'])).astype(np.float32)
    
    # Mocking a temporal window (batch, time_steps, features)
    # In a real scenario, we'd feed the actual last N days
    window_size = config['model_params']['temporal_window']
    temporal_input = np.tile(pharmacy_features, (1, window_size, 1))
    temporal_input = torch.tensor(temporal_input).to(DEVICE)
    
    # Prepare Graph Data (Spatial)
    x_gnn, edge_index = PROCESSOR.build_graph_data(num_regions=config['model_params']['num_regions'])
    x_gnn = x_gnn.to(DEVICE)
    edge_index = edge_index.to(DEVICE)
    
    # 3. Model Inference
    with torch.no_grad():
        # Predict
        prediction = model(temporal_input, x_gnn, edge_index)
        probability = float(prediction[0][0].item())
    
    # 4. Determine Risk Level
    risk_level = "LOW"
    if probability > 0.7:
        risk_level = "HIGH"
    elif probability > 0.4:
        risk_level = "MEDIUM"
        
    return {
        "outbreak_probability": round(probability * 100, 2), # Percentage
        "risk_level": risk_level,
        "region_id": data.get("region_id"),
        "timestamp": data.get("date_index"),
        "city": input_data if isinstance(input_data, str) else "Unknown"
    }

if __name__ == "__main__":
    # Test with city name
    result = predict_outbreak("Delhi")
    print(json.dumps(result, indent=4))
