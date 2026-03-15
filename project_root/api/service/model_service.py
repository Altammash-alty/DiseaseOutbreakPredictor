from inference.predict import predict_outbreak
# map region ids to city names
CITY_REGION_MAP = {
    "Delhi": 0,
    "Mumbai": 1,
    "Bangalore": 2,
    "Chennai": 3,
    "Kolkata": 4
}

# diseases for display
DISEASES = [
    "Dengue",
    "Flu",
    "Food Poisoning"
]


def run_model_for_city(city):

    region_id = CITY_REGION_MAP[city]

    # Normally these features come from your collectors
    model_input = {
        "search_queries": ["fever symptoms", "body pain"],
        "social_posts": ["people sick in city"],
        "pharmacy_features": [120, 34, 20, 45, 90],
        "region_id": region_id,
        "date_index": 200
    }

    result = predict_outbreak(model_input)

    probability = result["outbreak_probability"]

    diseases = []

    for disease in DISEASES:

        diseases.append({
            "name": disease,
            "probability": probability
        })

    return diseases