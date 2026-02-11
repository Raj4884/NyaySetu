import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def verify_training():
    print("🧠 Starting Model Training Verification...")
    
    case_types = ['Criminal', 'BAILC', 'CS', 'Civil', 'Commercial', 'Labour', 'OS']
    data = []
    
    for _ in range(1000):
        ctype = np.random.choice(case_types)
        evidence = np.random.randint(0, 25)
        hearings = np.random.randint(0, 15)
        
        score = 0.15
        if ctype in ['Criminal', 'BAILC']: score += 0.15
        score += (evidence * 0.08)
        score += (hearings * 0.05)
        
        if evidence == 0 and hearings == 0:
            score *= 0.8
            
        score = max(0.01, min(0.99, score))
        data.append([ctype, evidence, hearings, score])
    
    df = pd.DataFrame(data, columns=['ctype', 'evidence', 'hearings', 'score'])
    le = LabelEncoder()
    df['ctype_encoded'] = le.fit_transform(df['ctype'])
    
    X = df[['ctype_encoded', 'evidence', 'hearings']]
    y = df['score']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    print("\nTest Predictions on High vs Low activity:")
    test_cases = [
        ('Criminal', 20, 10, le.transform(['Criminal'])[0]),
        ('Civil', 1, 1, le.transform(['Civil'])[0])
    ]
    
    for ctype, e, h, enc in test_cases:
        pred = model.predict([[enc, e, h]])[0]
        print(f"Type: {ctype}, E: {e}, H: {h} -> Pred Score: {pred:.2f}")

    # Check variation in training labels
    print(f"\nTraining score range: {y.min():.2f} to {y.max():.2f}")
    print(f"Mean score: {y.mean():.2f}")

if __name__ == "__main__":
    verify_training()
