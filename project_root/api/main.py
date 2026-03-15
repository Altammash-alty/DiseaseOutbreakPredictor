from fastapi import FastAPI
from data.city_data import CITIES
from data.disease_data import DISEASE_PRECAUTIONS
from service.model_service import predict_city_diseases
from service.heatmap_service import generate_heatmap

app = FastAPI(title="Disease Outbreak API")


@app.get("/outbreak")
def get_outbreak():

    cities_output = []

    for city, coord in CITIES.items():

        predictions = predict_city_diseases(city)

        diseases = []

        for p in predictions:

            diseases.append({
                "name": p["name"],
                "probability": p["probability"],
                "precautions": DISEASE_PRECAUTIONS[p["name"]]
            })

        cities_output.append({
            "city": city,
            "lat": coord["lat"],
            "lng": coord["lng"],
            "diseases": diseases
        })

    heatmap = generate_heatmap(cities_output)

    return {
        "cities": cities_output,
        "heatmap": heatmap
    }