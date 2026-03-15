def generate_heatmap(cities):

    heatmap = []

    for city in cities:

        intensity = max(d["probability"] for d in city["diseases"])

        heatmap.append({
            "lat": city["lat"],
            "lng": city["lng"],
            "intensity": intensity
        })

    return heatmap