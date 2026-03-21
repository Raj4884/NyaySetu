import pandas as pd
import os

data_path = 'backend/data/cases.csv'
if os.path.exists(data_path):
    df = pd.read_csv(data_path, nrows=5)
    print("--- HEADERS ---")
    print(df.columns.tolist())
    print("\n--- SAMPLE ROW ---")
    print(df.iloc[0].to_dict())
else:
    print("File not found.")
