import requests
import json

SYMPTOMS = [
    "fever",
    "cough",
    "diarrhea",
    "headache",
    "nausea"
]

CITIES = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Chennai",
    "Kolkata"
]


def reddit_mentions(query):

    url = "https://www.reddit.com/search.json"

    params = {
        "q": query,
        "limit": 50
    }

    headers = {
        "User-Agent": "health-monitor"
    }

    response = requests.get(url, params=params, headers=headers)
    data = response.json()

    return len(data["data"]["children"])


def mastodon_mentions(query):

    url = "https://mastodon.social/api/v2/search"

    params = {
        "q": query,
        "type": "statuses"
    }

    response = requests.get(url, params=params)
    data = response.json()

    if "statuses" in data:
        return len(data["statuses"])

    return 0


def bluesky_mentions(query):

    url = "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts"

    params = {
        "q": query,
        "limit": 50
    }

    response = requests.get(url, params=params)
    data = response.json()

    if "posts" in data:
        return len(data["posts"])

    return 0


def collect_city_symptom_data():

    results = {}

    for city in CITIES:

        city_data = {}

        for symptom in SYMPTOMS:

            query = f"{symptom} {city}"

            reddit_count = reddit_mentions(query)
            mastodon_count = mastodon_mentions(query)
            bluesky_count = bluesky_mentions(query)

            city_data[symptom] = {
                "reddit": reddit_count,
                "mastodon": mastodon_count,
                "bluesky": bluesky_count
            }

        results[city] = city_data

    return results


if __name__ == "__main__":

    data = collect_city_symptom_data()

    print(json.dumps(data, indent=4))