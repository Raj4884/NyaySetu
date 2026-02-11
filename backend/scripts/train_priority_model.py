import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def train_model():
    print("🧠 Starting AI Priority Model Training...")
    
    # 1. Prepare Synthetic Training Data (Ground Truth Simulation)
    # In a real project, this would be human-labeled data.
    # We simulate a "Statutory Knowledge Base" for the model to learn.
    data = []
    case_types = ['Criminal', 'BAILC', 'CS', 'Civil', 'Commercial', 'Labour', 'OS']
    
    for _ in range(10000): # Increased sample size for better granularity
        ctype = np.random.choice(case_types)
        evidence = np.random.randint(0, 30)
        hearings = np.random.randint(0, 20)
        years_pending = np.random.uniform(0, 10) # 0 to 10 years seniority
        
        # Heuristic Logic for Ground Truth (FINELY BALANCED)
        score = 0.10 # Reduced Baseline
        if ctype in ['Criminal', 'BAILC', 'SESS']: score += 0.15 
        
        score += (evidence * 0.02) # Controlled activity growth
        score += (hearings * 0.015)
        score += (years_pending * 0.04) # Seniority impact
        
        # Freshness Penalty for new cases with no activity
        if evidence == 0 and hearings == 0 and years_pending < 1:
            score *= 0.6 # Significant reduction for very fresh matters
        
        # Add realistic noise
        score += np.random.normal(0, 0.02)
        score = max(0.01, min(0.99, score))
        
        data.append([ctype, evidence, hearings, years_pending, score])
    
    df = pd.DataFrame(data, columns=['case_type', 'evidence_count', 'hearing_count', 'years_pending', 'priority_score'])
    
    # 2. Preprocessing
    le = LabelEncoder()
    df['case_type_encoded'] = le.fit_transform(df['case_type'])
    
    X = df[['case_type_encoded', 'evidence_count', 'hearing_count', 'years_pending']]
    y = df['priority_score']
    
    # 3. Training (Random Forest)
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X, y)
    
    # 4. Save Artifacts
    model_dir = os.path.join('backend', 'ml_models')
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(model, os.path.join(model_dir, 'priority_model.joblib'))
    joblib.dump(le, os.path.join(model_dir, 'le_case_type.joblib'))
    
    print(f"✅ Training Complete. Model saved to {model_dir}")
    print(f"📈 Model Feature Importances: {dict(zip(X.columns, model.feature_importances_))}")

if __name__ == "__main__":
    train_model()
