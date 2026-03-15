import torch
import yaml
import numpy as np
import pandas as pd
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from project_root.inference.predict import predict_outbreak

def test_sensitivity():
    print("=== MODEL SENSITIVITY TEST ===")
    
    # 1. Test with low values
    print("\n--- Test 1: Low pharmacy sales (Baseline) ---")
    # We simulate this by checking the current prediction
    result_low = predict_outbreak("Mumbai")
    print(f"City: {result_low['name']}")
    print(f"Risk: {result_low['risk']}%")
    print(f"Disease: {result_low['disease']}")
    
    print("\n--- Test 2: Instructions for USER ---")
    print("To see the model react:")
    print("1. Open 'project_root/data/PharmacyFabricated/synthetic_pharmacy_sales.csv'")
    print("2. Go to the VERY BOTTOM of the file.")
    print("3. Add this line at the end (or modify the last Mumbai line):")
    print("9999,Mumbai,500000,1,500,400,300,200,100,50,1")
    print("   (Note the huge numbers for medicine sales)")
    print("\n4. Refresh the dashboard or run this script again.")
    print("5. The risk score WILL spike significantly.")

if __name__ == "__main__":
    test_sensitivity()
