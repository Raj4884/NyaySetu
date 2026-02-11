import pandas as pd
from mongoengine import connect
from app.models.case import Case
from app.services.ml_service import MLService
from datetime import datetime, timedelta
import os
import random

connect(host='mongodb://localhost:27017/nyaysetu_db')

def populate_real_data():
    csv_path = 'backend/data/cases.csv'
    if not os.path.exists(csv_path):
        print("CSV not found.")
        return

    print("Populating database with production samples...")
    # Clear existing non-essential cases if needed, but here we just add
    df = pd.read_csv(csv_path, nrows=100) # Inject 100 interesting cases
    
    ml = MLService()
    
    for _, row in df.iterrows():
        cnr = str(row['CASE_TYPE'])[:2] + "-" + str(random.randint(1000, 9999)) + "-" + str(random.randint(2020, 2026))
        
        case = Case(
            case_number=cnr,
            case_type=str(row['CASE_TYPE']),
            title=f"Proceedings: {row['CASE_TYPE']} - Ref {cnr[-4:]}",
            description="Automated sync from judicial production logs.",
            filing_date=datetime.now() - timedelta(days=random.randint(1, 365)),
            urgency=random.choice(['High', 'Medium', 'Low']),
            number_of_evidence=int(row.get('Number_of_Evidence', 0)),
            hearing_count=int(row.get('HEARING_COUNT', 0)),
            status=random.choice(['Pending', 'Processed', 'Scheduled'])
        )
        
        # Run through ML service for priority
        p, s = ml.predict(case)
        case.predicted_priority = p
        case.priority_score = s
        case.save()

    print(f"✅ Successfully injected {len(df)} real-world samples.")

if __name__ == "__main__":
    populate_real_data()
