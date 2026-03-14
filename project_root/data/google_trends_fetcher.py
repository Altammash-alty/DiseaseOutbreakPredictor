from serpapi.google_search import GoogleSearch
import json
import time

# -------- API SECTION --------
API_KEY = "c1432a00c275b9d2ca442f5a9dbec50d2cec8ac9651104750fed2ca301cef8c5"   # paste your SerpApi key here
# -----------------------------

SYMPTOMS = {
    "fever": "fever symptoms",
    "cough": "cough treatment",
    "diarrhea": "diarrhea medicine",
    "headache": "headache relief",
    "nausea": "nausea symptoms"
}

CITY_LOCATION = {
    "Delhi": "Delhi, India",
    "Meerut": "Meerut, India",
    "Mumbai": "Mumbai, India",
    "Bangalore": "Bangalore, India"
}

DEVICES = ["desktop", "mobile"]


def get_results_count(data):
    """
    Extract total result count safely
    """

    if "search_information" in data:
        info = data["search_information"]

        if "total_results" in info:
            return int(info["total_results"])

    return 0


def fetch_city_search_counts(city):

    location = CITY_LOCATION[city]
    results = {}

    for symptom, query in SYMPTOMS.items():

        device_counts = []

        for device in DEVICES:

            params = {
                "engine": "google",
                "q": query,
                "location": location,
                "hl": "en",
                "gl": "in",
                "tbs": "qdr:d",
                "device": device,
                "num": 10,
                "api_key": API_KEY
            }

            search = GoogleSearch(params)
            data = search.get_dict()

            count = get_results_count(data)
            device_counts.append(count)

            time.sleep(3)  # delay to avoid unstable responses

        results[symptom] = max(device_counts)

    return {
        "city": city,
        "past_24_hours_search_counts": results
    }


if __name__ == "__main__":

    city = "Delhi"

    result = fetch_city_search_counts(city)

    print(json.dumps(result, indent=4))