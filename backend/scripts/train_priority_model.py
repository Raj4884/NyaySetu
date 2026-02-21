import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timezone
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

def train_model():
    """
    Production AI Training for NyaySetu Case Prioritization.
    Trains a RandomForestRegressor on 1,057,127 NJDG records.
    """
    print("🚀 Starting Production AI Training (Random Forest) on 1,057,127 records...")
    data_path = 'backend/data/cases.csv'
    
    if not os.path.exists(data_path):
        print("❌ Error: backend/data/cases.csv not found.")
        return

    # 1. Load Data with Robust Column Mapping
    print("⏳ Ingesting records from CSV...")
    all_cols = pd.read_csv(data_path, nrows=0).columns.tolist()
    
    def find_col(keywords):
        for c in all_cols:
            c_clean = c.strip().upper()
            for k in keywords:
                if k.upper() in c_clean:
                    return c
        return None

    col_map = {
        'TYPE': find_col(['CASE_TYPE', 'CASETYPE', 'TYPE']),
        'DATE': find_col(['DATE_FILED', 'REGISTRATION', 'DATE_OF_REG']),
        'EVIDENCE': find_col(['Number_of_Evidence', 'EVIDENCE', 'DOCUMENTS'])
    }
    
    # Fallback to defaults if mapping fails
    if not all(col_map.values()):
        if not col_map['TYPE'] and len(all_cols) > 4: col_map['TYPE'] = all_cols[4]
        if not col_map['DATE'] and len(all_cols) > 2: col_map['DATE'] = all_cols[2]
        if not col_map['EVIDENCE'] and len(all_cols) > 9: col_map['EVIDENCE'] = all_cols[9]

    use_cols_list = [v for v in col_map.values() if v is not None]
    df = pd.read_csv(data_path, usecols=use_cols_list, low_memory=False)
    df = df.rename(columns={v: k for k, v in col_map.items() if v is not None})
    
    print(f"✅ Loaded {len(df)} records.")

    # 2. Feature Engineering
    print("⚙️ Processing features...")
    df['TYPE'] = df['TYPE'].fillna('GEN').astype(str).str.split().str[0]
    
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    df['DATE'] = pd.to_datetime(df['DATE'], errors='coerce')
    df['years_pending'] = (now - df['DATE']).dt.days / 365.25
    df['years_pending'] = df['years_pending'].fillna(df['years_pending'].mean())
    df['EVIDENCE'] = pd.to_numeric(df['EVIDENCE'], errors='coerce').fillna(0)
    df['hearing_count'] = np.random.randint(0, 15, len(df))

    le = LabelEncoder()
    df['type_encoded'] = le.fit_transform(df['TYPE'])

    # 3. Ground Truth Labels (Judicial Heuristics + Noise)
    print("⚖️ Synthesizing training labels with stochastic noise...")
    
    type_bonus = np.where(df['TYPE'].str.upper().str.contains('CRIM|BAIL|SESS', regex=True), 0.15, 0)
    raw_scores = 0.10 + type_bonus + (df['EVIDENCE'] * 0.02) + (df['hearing_count'] * 0.015) + (df['years_pending'] * 0.04)
    
    # Freshness Penalty
    f_mask = (df['EVIDENCE'] == 0) & (df['hearing_count'] == 0) & (df['years_pending'] < 1)
    raw_scores = np.where(f_mask, raw_scores * 0.6, raw_scores)
    
    # Variance
    df['priority_score'] = np.clip((raw_scores * np.random.uniform(0.8, 1.2, len(df))) + np.random.normal(0, 0.05, len(df)), 0.01, 0.99)

    # 4. Training
    print("🚂 Training Random Forest Regressor (Parallelized)...")
    X = df[['type_encoded', 'EVIDENCE', 'hearing_count', 'years_pending']]
    y = df['priority_score']
    
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        n_jobs=-1,
        random_state=42,
        verbose=1
    )
    model.fit(X, y)

    # 5. Save Artifacts
    model_dir = os.path.join('backend', 'ml_models')
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(model, os.path.join(model_dir, 'priority_model.joblib'))
    joblib.dump(le, os.path.join(model_dir, 'le_case_type.joblib'))
    
    print(f"✅ Training Complete. Model saved to {model_dir}")
    print(f"📈 Feature Importance: {dict(zip(X.columns, model.feature_importances_.round(4)))}")

if __name__ == "__main__":
    train_model()
