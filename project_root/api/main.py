from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from project_root.inference.predict import predict_outbreak
import uvicorn
import os
import sys

# Ensure project root is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

app = FastAPI(title="Disease Outbreak Prediction API")

# Enable CORS for React integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CityRequest(BaseModel):
    city: str

@app.get("/")
def read_root():
    return {"status": "online", "message": "Outbreak Prediction API is active"}

@app.post("/predict")
def predict(city_request: CityRequest):
    """
    Predicts outbreak risk for a given city.
    """
    try:
        result = predict_outbreak(city_request.city)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/all_predictions")
def get_all_predictions():
    """
    Returns predictions for all cities defined in the config mapping.
    """
    from project_root.inference.predict import config
    cities = list(config['model_params'].get('city_mapping', {}).keys())
    results = {}
    for city in cities:
        try:
            results[city] = predict_outbreak(city)
        except:
            results[city] = {"error": "Failed to fetch"}
    return results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)