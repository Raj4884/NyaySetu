import pandas as pd
df = pd.read_csv('backend/data/cases.csv', nrows=0)
with open('backend/scripts/cols.txt', 'w') as f:
    for col in df.columns:
        f.write(col + '\n')
