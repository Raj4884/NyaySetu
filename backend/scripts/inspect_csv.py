import pandas as pd
data_path = 'backend/data/cases.csv'
df = pd.read_csv(data_path, nrows=1)
print(f"Headers: {df.columns.tolist()}")
print(df.head(1).to_dict())
