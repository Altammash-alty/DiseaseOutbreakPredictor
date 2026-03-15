import pandas as pd
df = pd.read_csv('project_root/data/PharmacyFabricated/synthetic_pharmacy_sales.csv')
for city in ['Mumbai','Delhi','Bangalore','Chennai','Kolkata']:
    city_rows = df[df['city']==city]
    if city_rows.empty:
        print(f"{city}: NO DATA")
        continue
    last = city_rows.iloc[-1]
    print(f"{city}: fever={last['fever_medicine_sales']} cough={last['cough_medicine_sales']} diarrhea={last['diarrhea_medicine_sales']}")
