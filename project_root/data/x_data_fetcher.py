import tweepy
import json

# Your X API Bearer Token
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAIMJ8QEAAAAApeP8stjJo2BGJ5zgeO1nG3pZ2eo%3DoKUwHriVw4eyloO76jglh3tnIRma1IDHQwF2Ukbi9tk38Ock7N"

client = tweepy.Client(bearer_token=BEARER_TOKEN)

SYMPTOMS = [
    "fever",
    "cough",
    "diarrhea",
    "headache",
    "nausea"
]

CITY_COORDS = {
    "Delhi": "28.6139,77.2090",
    "Meerut": "28.9845,77.7064",
    "Mumbai": "19.0760,72.8777",
    "Bangalore": "12.9716,77.5946"
}


def fetch_city_counts(city):

    coords = CITY_COORDS[city]

    results = {}

    for symptom in SYMPTOMS:

        query = f"{symptom} lang:en -is:retweet point_radius:[{coords} 50km]"

        tweets = client.search_recent_tweets(
            query=query,
            max_results=100
        )

        count = 0

        if tweets.data:
            count = len(tweets.data)

        results[symptom] = count

    return {
        "city": city,
        "symptom_counts_last_4_days": results
    }


if __name__ == "__main__":

    city = "Delhi"

    data = fetch_city_counts(city)

    print(json.dumps(data, indent=4))