import pandas as pd
import numpy as np
import json
import random
import os
from datetime import datetime, timedelta

def generate_synthetic_data(num_samples=1000, num_regions=10):
    """
    Generates synthetic dataset for disease outbreak prediction.
    """
    np.random.seed(42)
    random.seed(42)

    symptoms = ["fever", "cough", "diarrhea", "headache", "body pain", "nausea", "fatigue"]
    queries_pool = [
        "how to treat {symptom}", "symptoms of {symptom}", "why do I have {symptom}",
        "{symptom} remedy", "medicine for {symptom}", "severe {symptom} in kids"
    ]
    posts_pool = [
        "So many people have {symptom} lately", "Feeling terrible with {symptom}",
        "Is there a {symptom} outbreak?", "Hospital is full of {symptom} cases",
        "My whole family has {symptom}"
    ]

    data = []
    start_date = datetime(2023, 1, 1)

    for i in range(num_samples):
        date_index = i // num_regions
        region_id = i % num_regions
        current_date = start_date + timedelta(days=date_index)

        # Simulate seasonal spikes or random outbreaks
        is_outbreak = 0
        # Simple rule: outbreak spike every 100 days or so, or randomly
        if (date_index % 90 > 70) or (random.random() > 0.95):
            is_outbreak = 1

        # Adjust features based on outbreak status
        multiplier = 2.0 if is_outbreak else 1.0
        
        # Pharmacy features (randomized sales counts)
        pharmacy_features = [
            int(np.random.poisson(100 * multiplier)), # Fever meds
            int(np.random.poisson(30 * multiplier)),  # Diarrhea meds
            int(np.random.poisson(20 * multiplier)),  # Cough syrup
            int(np.random.poisson(40 * multiplier)),  # Painkillers
            int(np.random.poisson(80 * multiplier))   # Antibiotics
        ]

        # Generate text signals
        num_queries = random.randint(1, 5)
        num_posts = random.randint(1, 3)
        
        selected_symptoms = random.sample(symptoms, k=2) if is_outbreak else random.sample(symptoms, k=1)
        
        search_queries = [random.choice(queries_pool).format(symptom=random.choice(selected_symptoms)) for _ in range(num_queries)]
        social_posts = [random.choice(posts_pool).format(symptom=random.choice(selected_symptoms)) for _ in range(num_posts)]

        data.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "region_id": region_id,
            "pharmacy_features": pharmacy_features,
            "search_queries": "|".join(search_queries),
            "social_posts": "|".join(social_posts),
            "outbreak_label": is_outbreak
        })

    df = pd.DataFrame(data)
    
    # Save to CSV
    output_path = "project_root/data/generated_dataset/synthetic_outbreak_data.csv"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Synthetic data generated at: {output_path}")
    return df

if __name__ == "__main__":
    generate_synthetic_data()
