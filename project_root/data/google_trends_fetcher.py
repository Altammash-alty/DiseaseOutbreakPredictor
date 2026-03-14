from pytrends.request import TrendReq
import json
import time

SYMPTOMS = [
    "fever",
    "cough",
    "diarrhea",
    "headache",
    "nausea"
]

CITY_STATE = {
    "Delhi": "IN-DL",
    "Meerut": "IN-UP",
    "Mumbai": "IN-MH",
    "Bangalore": "IN-KA"
}

def fetch_city_trends(city):

    geo_code = CITY_STATE[city]

    pytrends = TrendReq(hl="en-US", tz=330)

    pytrends.build_payload(
        SYMPTOMS,
        timeframe="now 1-d",
        geo=geo_code
    )

    data = pytrends.interest_over_time()

    if "isPartial" in data.columns:
        data = data.drop(columns=["isPartial"])

    return {
        "city": city,
        "data": data.to_dict(orient="records")
    }


if __name__ == "__main__":

    time.sleep(5)  # small delay to avoid rate limit

    result = fetch_city_trends("Delhi")

    print(json.dumps(result, indent=4))