import requests, json

r = requests.get("http://localhost:8000/all_predictions", timeout=10)
d = r.json()
for city, v in d.items():
    dbg = v.get("debug", {})
    print(f"{city}: risk={v['risk']}%, disease={v['disease']}")
    print(f"   fever={dbg.get('fever_sales')}, avg_fever={dbg.get('city_avg_fever')}, spike={dbg.get('spike_factor')}")
