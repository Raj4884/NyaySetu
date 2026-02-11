import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

def train_model():
    data_path = 'backend/data/cases.csv'
    if not os.path.exists(data_path):
        print(f"Data not found at {data_path}")
        return

    print("Loading production dataset (sampling 50k records for efficiency)...")
    # Read a sample to avoid memory issues with 1M rows in dev
    df = pd.read_csv(data_path, nrows=50000)
    
    # Feature Engineering
    # We use columns: CASE_TYPE, Number_of_Evidence, hearing_count (if available)
    # Target: Deriving a priority score for training (simulating ground truth)
    
    cols = ['CASE_TYPE', 'Number_of_Evidence', 'HEARING_COUNT']
    for col in cols:
        if col not in df.columns:
            df[col] = 0
            
    # Fill NAs
    df['Number_of_Evidence'] = pd.to_numeric(df['Number_of_Evidence'], errors='coerce').fillna(0)
    df['HEARING_COUNT'] = pd.to_numeric(df['HEARING_COUNT'], errors='coerce').fillna(0)
    
    # Target derivation: High evidence + High hearing count = High priority
    df['priority_target'] = (df['Number_of_Evidence'] * 0.6) + (df['HEARING_COUNT'] * 0.4)
    # Scale 0-1
    max_score = df['priority_target'].max() if df['priority_target'].max() > 0 else 1
    df['priority_target'] = df['priority_target'] / max_score

    # Encoding
    le_type = LabelEncoder()
    df['type_encoded'] = le_type.fit_transform(df['CASE_TYPE'].astype(str))
    
    X = df[['type_encoded', 'Number_of_Evidence', 'HEARING_COUNT']]
    y = df['priority_target']
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    # Save artifacts
    model_dir = 'backend/ml_models'
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(model, os.path.join(model_dir, 'priority_model.joblib'))
    joblib.dump(le_type, os.path.join(model_dir, 'le_case_type.joblib'))
    
    print(f"✅ Training Complete. Model saved to {model_dir}")
    print(f"Final R2 Score: {model.score(X, y):.4f}")

if __name__ == "__main__":
    train_model()
