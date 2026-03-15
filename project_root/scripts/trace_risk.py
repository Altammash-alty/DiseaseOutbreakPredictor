import pandas as pd
import os
import yaml

config_path = "project_root/configs/model_config.yaml"
with open(config_path, "r") as f:
    config = yaml.safe_load(f)

FEATURE_COLS = config['model_params']['pharmacy_feature_cols']
CITY_MAP = config['model_params']['city_mapping']
DATA_PATH = config['paths']['real_data']

df = pd.read_csv(DATA_PATH)

for city_name in CITY_MAP.keys():
    city_data = df[df['city'] == city_name]
    if city_data.empty: continue
    
    latest = city_data.iloc[-1]
    features = {col: float(latest[col]) for col in FEATURE_COLS if col in latest}

    fever    = features.get('fever_medicine_sales', 0)
    cough    = features.get('cough_medicine_sales', 0)
    diarrhea = features.get('diarrhea_medicine_sales', 0)

    base_fever    = float(city_data['fever_medicine_sales'].mean()) if 'fever_medicine_sales' in city_data else 20
    base_cough    = float(city_data['cough_medicine_sales'].mean()) if 'cough_medicine_sales' in city_data else 20
    base_diarrhea = float(city_data['diarrhea_medicine_sales'].mean()) if 'diarrhea_medicine_sales' in city_data else 20

    spike_fever    = (fever    / (base_fever    + 1))
    spike_cough    = (cough    / (base_cough    + 1))
    spike_diarrhea = (diarrhea / (base_diarrhea + 1))

    max_spike = max(spike_fever, spike_cough, spike_diarrhea)
    avg_spike = (spike_fever + spike_cough + spike_diarrhea) / 3.0
    
    risk_score = 10.0 + (max(0, max_spike - 1.0) * 20.0) + (max(0, avg_spike - 1.0) * 5.0)
    
    print(f"CITY: {city_name}")
    print(f"  fever: {fever} (avg: {base_fever:.1f}) -> spike: {spike_fever:.2f}")
    print(f"  cough: {cough} (avg: {base_cough:.1f}) -> spike: {spike_cough:.2f}")
    print(f"  diarrhea: {diarrhea} (avg: {base_diarrhea:.1f}) -> spike: {spike_diarrhea:.2f}")
    print(f"  FINAL RISK: {risk_score:.1f}")
    print("-" * 30)
