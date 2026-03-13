from fastapi import FastAPI
from pydantic import BaseModel

from inference.predict import predict_outbreak

app = FastAPI()

class CityRequest(BaseModel):
    city: str

@app.post("/predict")
def predict(city_request: CityRequest):

    result = predict_outbreak(city_request.city)

    return {
        "city": city_request.city,
        "diseases": result
    }