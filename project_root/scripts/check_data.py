import pandas as pd
df = pd.read_csv('project_root/data/PharmacyFabricated/synthetic_pharmacy_sales.csv')
for city in ['Mumbai','Delhi','Bangalore','Chennai','Kolkata']:
    cd = df[df['city']==city]
    if cd.empty: continue
    last = cd.iloc[-1]
    print(f"--- {city} ---")
    for col in ['fever_medicine_sales', 'cough_medicine_sales', 'diarrhea_medicine_sales', 'antibiotic_sales', 'painkiller_sales']:
        val = float(last[col])
        avg = cd[col].mean()
        spike = val / (avg + 1)
        print(f"  {col}: val={val:.1f} avg={avg:.1f} spike={spike:.2f}")
    print()
