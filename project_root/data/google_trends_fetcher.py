from pytrends.request import TrendReq

pytrends = TrendReq()

SYMPTOMS = [
    "fever",
    "cough",
    "diarrhea",
    "headache",
    "body pain",
    "nausea",
    "fatigue"
]

CITIES = {
    "Delhi": "IN-DL",
    "Mumbai": "IN-MH",
    "Bangalore": "IN-KA",
    "Chennai": "IN-TN",
    "Kolkata": "IN-WB"
}


def fetch_city_trends(city):

    geo_code = CITIES[city]

    pytrends.build_payload(
        SYMPTOMS,
        timeframe="now 7-d",
        geo=geo_code
    )

    data = pytrends.interest_over_time()

    if "isPartial" in data.columns:
        data = data.drop(columns=["isPartial"])

    return data.iloc[-1].to_dict()