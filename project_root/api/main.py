from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import sys
import yaml
import pandas as pd
import numpy as np

# Ensure project root is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

app = FastAPI(title="Disease Outbreak Prediction API")

@app.on_event("startup")
async def warmup_model():
    """Pre-load BERT and the ML model at startup so first prediction is instant."""
    import threading
    def _warm():
        try:
            print("\n🔥 [STARTUP] Pre-warming BERT model...")
            from project_root.inference.predict import load_model, PROCESSOR, DEVICE
            import torch
            load_model()
            # Run one dummy BERT pass to fully initialize
            dummy_text = "Normal health activity in city."
            ids, mask = PROCESSOR.preprocess_text(dummy_text)
            ids, mask = ids.to(DEVICE), mask.to(DEVICE)
            print("✅ [STARTUP] BERT model warmed up! Predictions will now be instant.\n")
        except Exception as e:
            print(f"⚠️  [STARTUP] Model warmup failed (will load on first request): {e}\n")
    threading.Thread(target=_warm, daemon=True).start()

# Enable CORS for React integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Config ────────────────────────────────────────────────────────────────
config_path = "project_root/configs/model_config.yaml"
with open(config_path, "r") as f:
    config = yaml.safe_load(f)

FEATURE_COLS = config['model_params']['pharmacy_feature_cols']
CITY_MAP = config['model_params']['city_mapping']
DATA_PATH = config['paths']['real_data']


class CityRequest(BaseModel):
    city: str


def predict_from_csv(city_name: str) -> dict:
    """
    Fast, data-driven prediction directly from the CSV.
    No BERT/LSTM - reads your fabricated data instantly.
    """
    # ── Load latest CSV every request so changes are instantly reflected ──
    if not os.path.exists(DATA_PATH):
        return {"error": f"Data file not found: {DATA_PATH}"}

    df = pd.read_csv(DATA_PATH)
    city_data = df[df['city'] == city_name]

    if city_data.empty:
        return {
            "city": city_name, "name": city_name,
            "risk": 5, "risk_level": "LOW",
            "healthIndex": 95, "disease": "No Data",
            "live_signals": "No data available for this city.",
            "region_id": CITY_MAP.get(city_name, 0),
            "timestamp": 0
        }

    # ── Use the absolute LAST row for this city (most recent data you edited) ──
    latest = city_data.iloc[-1]
    features = {col: float(latest[col]) for col in FEATURE_COLS if col in latest}

    fever    = features.get('fever_medicine_sales', 0)
    cough    = features.get('cough_medicine_sales', 0)
    diarrhea = features.get('diarrhea_medicine_sales', 0)
    antibio  = features.get('antibiotic_sales', 0)
    pain     = features.get('painkiller_sales', 0)

    # ── Compute city-wide baseline (mean) for comparison ──
    base_fever    = float(city_data['fever_medicine_sales'].mean()) if 'fever_medicine_sales' in city_data else 20
    base_cough    = float(city_data['cough_medicine_sales'].mean()) if 'cough_medicine_sales' in city_data else 20
    base_diarrhea = float(city_data['diarrhea_medicine_sales'].mean()) if 'diarrhea_medicine_sales' in city_data else 20

    # ── Risk score: How much the latest data spikes above the historical average ──
    spike_fever    = (fever    / (base_fever    + 1))
    spike_cough    = (cough    / (base_cough    + 1))
    spike_diarrhea = (diarrhea / (base_diarrhea + 1))
    
    # If spike is 1.0 (normal), risk should be low (~10-15%)
    # If spike is 4.0+ (4x average), risk should be high (>80%)
    max_spike = max(spike_fever, spike_cough, spike_diarrhea)
    avg_spike = (spike_fever + spike_cough + spike_diarrhea) / 3.0
    
    # Formula: Baseline 10% + 20% for every 'x' above average
    # If max_spike is 1.2, risk = 10 + (0.2 * 20) = 14%
    # If max_spike is 5.0, risk = 10 + (4.0 * 20) = 90%
    risk_score = 10.0 + (max(0, max_spike - 1.0) * 20.0) + (max(0, avg_spike - 1.0) * 5.0)
    risk_score = round(min(99.0, max(5.0, risk_score)), 1)

    # ── Disease classification ──
    if diarrhea > fever and diarrhea > cough:
        primary_disease = "Cholera/Typhoid"
    elif cough > fever:
        primary_disease = "Influenza/COVID-19"
    elif fever > base_fever * 1.5:
        primary_disease = "Dengue/Malaria"
    else:
        primary_disease = "Minimal Risk"

    risk_level = "CRITICAL" if risk_score > 70 else "ELEVATED" if risk_score > 40 else "LOW"

    print(f"\n✅ [{city_name}] DATA USED:")
    print(f"   fever={fever:.0f} (avg={base_fever:.0f}), cough={cough:.0f} (avg={base_cough:.0f}), diarrhea={diarrhea:.0f} (avg={base_diarrhea:.0f})")
    print(f"   → Risk: {risk_score}% | Disease: {primary_disease}")

    return {
        "city": city_name,
        "name": city_name,
        "risk": risk_score,
        "risk_level": risk_level,
        "healthIndex": max(1, 100 - int(risk_score)),
        "disease": primary_disease,
        "live_signals": f"Latest pharmacy data: fever={fever:.0f}, cough={cough:.0f}, diarrhea={diarrhea:.0f} units sold.",
        "region_id": CITY_MAP.get(city_name, 0),
        "timestamp": int(latest.get('date_index', 0)),
        "debug": {
            "data_file": os.path.basename(DATA_PATH),
            "last_row_index": int(latest.name),
            "fever_sales": fever,
            "cough_sales": cough,
            "diarrhea_sales": diarrhea,
            "city_avg_fever": round(base_fever, 1),
            "spike_factor": round(max(spike_fever, spike_cough, spike_diarrhea), 2)
        }
    }


@app.get("/")
def read_root():
    return {"status": "online", "message": "Outbreak Prediction API is active"}


@app.post("/predict")
def predict(city_request: CityRequest):
    return predict_from_csv(city_request.city)


@app.get("/all_predictions")
def get_all_predictions():
    """
    Returns instant predictions for all cities from the CSV.
    Changes to the CSV are reflected IMMEDIATELY - no restart needed.
    """
    results = {}
    for city in CITY_MAP.keys():
        results[city] = predict_from_csv(city)
    return results


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
