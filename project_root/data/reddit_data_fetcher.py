import praw
import json
from datetime import datetime, timedelta

reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    user_agent="disease-outbreak-monitor"
)

SYMPTOMS = [
    "fever",
    "cough",
    "diarrhea",
    "headache",
    "nausea"
]

CITY_KEYWORDS = {
    "Delhi": ["delhi"],
    "Meerut": ["meerut"],
    "Mumbai": ["mumbai"],
    "Bangalore": ["bangalore"]
}

SUBREDDITS = ["india", "delhi", "bangalore", "mumbai", "AskIndia"]


def fetch_city_counts(city):

    results = {symptom: 0 for symptom in SYMPTOMS}

    four_days_ago = datetime.utcnow() - timedelta(days=4)
    four_days_timestamp = four_days_ago.timestamp()

    for subreddit in SUBREDDITS:

        for submission in reddit.subreddit(subreddit).new(limit=200):

            if submission.created_utc < four_days_timestamp:
                continue

            text = (submission.title + " " + submission.selftext).lower()

            if any(keyword in text for keyword in CITY_KEYWORDS[city]):

                for symptom in SYMPTOMS:
                    if symptom in text:
                        results[symptom] += 1

    return {
        "city": city,
        "symptom_counts_last_4_days": results
    }


if __name__ == "__main__":

    city = "Delhi"

    data = fetch_city_counts(city)

    print(json.dumps(data, indent=4))