import torch
import torch.nn as nn
import numpy as np
import yaml
import json
import os
import pandas as pd
import sys

# Ensure project root is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from project_root.pipeline.data_preprocessing import DataProcessor
from project_root.models.outbreak_predictor import OutbreakPredictor

# Import live fetchers
try:
    from project_root.data.google_trends_fetcher import fetch_city_search_counts
    from project_root.data.reddit_data_fetcher import reddit_mentions, mastodon_mentions, bluesky_mentions
except ImportError:
    print("Warning: Live fetchers not found. Using mock live data.")
    fetch_city_search_counts = None

# Load configuration
config_path = "project_root/configs/model_config.yaml"
if not os.path.exists(config_path):
    config_path = os.path.join(os.path.dirname(__file__), "..", "configs", "model_config.yaml")

with open(config_path, "r") as f:
    config = yaml.safe_load(f)

# Global variables
MODEL = None
PROCESSOR = DataProcessor(model_name=config['model_params']['bert_model_name'])
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    global MODEL
    if MODEL is None:
        save_path = config['paths']['model_save_dir']
        if not os.path.isabs(save_path):
            save_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", save_path))
            
        model_file = os.path.join(save_path, "model.pth")
        MODEL = OutbreakPredictor(config)
        
        if os.path.exists(model_file):
            try:
                # Weights might have different dimensions now with BERT integrated, but we'll try
                state_dict = torch.load(model_file, map_location=DEVICE)
                # Filter out incompatible layers if necessary (e.g. if previous training had no BERT)
                model_dict = MODEL.state_dict()
                state_dict = {k: v for k, v in state_dict.items() if k in model_dict and v.size() == model_dict[k].size()}
                model_dict.update(state_dict)
                MODEL.load_state_dict(model_dict)
                print(f"Model weights loaded. (BERT layers initialized from pre-trained)")
            except Exception as e:
                print(f"Error loading weights: {e}")
        MODEL.to(DEVICE)
        MODEL.eval()
    return MODEL

def fetch_live_api_data(city_name):
    """
    Fetches live data from Google Trends, Reddit, X, etc., and averages them.
    """
    aggregated_text = []
    total_mentions = 0
    
    # 1. Google Trends (Mocked or Real)
    if fetch_city_search_counts:
        try:
            # We only do one symptom for speed in a hackathon demo
            trends = fetch_city_search_counts(city_name)
            counts = list(trends['past_24_hours_search_counts'].values())
            avg_count = sum(counts) / len(counts) if counts else 0
            total_mentions += avg_count
            aggregated_text.append(f"Google searches show {avg_count} requests for symptoms in {city_name}.")
        except:
            pass
            
    # 2. Social Media Mentions
    social_query = f"fever {city_name}"
    try:
        r_mentions = reddit_mentions(social_query)
        m_mentions = mastodon_mentions(social_query)
        b_mentions = bluesky_mentions(social_query)
        
        social_avg = (r_mentions + m_mentions + b_mentions) / 3
        total_mentions += social_avg
        aggregated_text.append(f"Social media activity (Reddit/Mastodon/Bluesky) averages {social_avg:.1f} mentions.")
    except:
        pass

    return " ".join(aggregated_text), total_mentions

def predict_outbreak(city_name):
    """
    Inference fusing live API data and historical pharmacy trends.
    """
    model = load_model()
    
    # 1. Map City to Region ID
    city_map = config['model_params'].get('city_mapping', {})
    region_id = city_map.get(city_name, 0) # Fallback to 0

    # 2. Get Live API Data (BERT Input)
    live_text, live_count = fetch_live_api_data(city_name)
    if not live_text:
        live_text = f"Normal health activity reported in {city_name}."
    
    # 3. Get Historical Pharmacy Features (LSTM Input)
    real_data_path = config['paths'].get('real_data', "project_root/data/real_pharmacy_data.csv")
    if not os.path.isabs(real_data_path):
         real_data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", real_data_path))

    pharmacy_features = [0]*config['model_params']['lstm_input_dim']
    primary_disease = "Unknown"
    
    if os.path.exists(real_data_path):
        df = pd.read_csv(real_data_path)
        city_data = df[df['city'] == city_name]
        if not city_data.empty:
            latest = city_data.sort_values('date_index', ascending=False).iloc[0]
            feature_cols = config['model_params']['pharmacy_feature_cols']
            pharmacy_features = latest[feature_cols].values.tolist()
            
            # Heuristic for disease type based on highest sales spike
            fever = latest['fever_medicine_sales']
            cough = latest['cough_medicine_sales']
            diarrhea = latest['diarrhea_medicine_sales']
            
            if diarrhea > fever and diarrhea > cough: primary_disease = "Cholera/Typhoid"
            elif cough > fever: primary_disease = "Influenza/COVID-19"
            else: primary_disease = "Dengue/Malaria"

    # 4. Prepare Tensors
    input_ids, attention_mask = PROCESSOR.preprocess_text(live_text)
    input_ids, attention_mask = input_ids.to(DEVICE), attention_mask.to(DEVICE)
    
    window_size = config['model_params']['temporal_window']
    temporal_input = np.tile(pharmacy_features, (1, window_size, 1)).astype(np.float32)
    temporal_input = torch.tensor(temporal_input).to(DEVICE)
    
    x_gnn, edge_index = PROCESSOR.build_graph_data(num_regions=config['model_params']['num_regions'])
    x_gnn = x_gnn.to(DEVICE)
    edge_index = edge_index.to(DEVICE)
    
    # 5. Model Inference
    with torch.no_grad():
        prediction = model(temporal_input, x_gnn, edge_index, input_ids, attention_mask)
        probability = float(prediction[0][0].item())
    
    # Factor in live_count
    if live_count > 50:
        probability = min(1.0, probability + 0.15)
        
    risk_score = round(probability * 100, 2)
    risk_level = "LOW"
    if risk_score > 70: risk_level = "CRITICAL"
    elif risk_score > 40: risk_level = "ELEVATED"
        
    return {
        "city": city_name,
        "outbreak_probability": risk_score,
        "risk_level": risk_level,
        "health_index": max(0, 100 - int(risk_score)),
        "primary_disease": primary_disease,
        "live_signals": live_text,
        "region_id": region_id,
        "timestamp": int(latest['date_index']) if 'latest' in locals() else 0
    }

if __name__ == "__main__":
    result = predict_outbreak("Delhi")
    print(json.dumps(result, indent=4))
