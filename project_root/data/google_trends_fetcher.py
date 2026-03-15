"""
Fabricated Google Trends fetcher — returns instant mock data.
Keeps the original predict.py import intact.
"""

MOCK_TRENDS = {
    "Mumbai":    {"fever": 380, "cough": 290, "diarrhea": 120},
    "Delhi":     {"fever": 420, "cough": 310, "diarrhea": 95},
    "Kolkata":   {"fever": 280, "cough": 180, "diarrhea": 340},
    "Chennai":   {"fever": 190, "cough": 140, "diarrhea": 260},
    "Bangalore": {"fever": 85,  "cough": 72,  "diarrhea": 40},
}

def fetch_city_search_counts(city_name: str) -> dict:
    """Returns fabricated Google Trends search counts instantly."""
    data = MOCK_TRENDS.get(city_name, {"fever": 50, "cough": 40, "diarrhea": 30})
    return {
        "city": city_name,
        "past_24_hours_search_counts": {
            "fever symptoms": data["fever"],
            "cough treatment": data["cough"],
            "diarrhea medicine": data["diarrhea"],
        }
    }