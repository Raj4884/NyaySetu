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

    print(f"Cleaning existing cases and preparing for massive ingestion (1M+ rows)...")
    Case.objects.delete()
    
    ml = MLService()
    chunk_size = 5000 # Large chunks for speed
    count = 0
    
    # Using chunksize for memory efficiency
    for chunk in pd.read_csv(csv_path, chunksize=chunk_size):
        chunk = chunk.fillna('')
        cases_to_create = []
        
        for _, row in chunk.iterrows():
            cnr = str(row.get('CNR_NUMBER', ''))
            if not cnr or cnr == 'nan':
                cnr = f"GEN-{random.randint(1000, 9999)}-{random.getrandbits(24)}"
                
            court_name = str(row.get('COURT_NAME', ''))
            hc_name = str(row.get('NAME_OF_HIGH_COURT', ''))
            
            c_type = 'District Court'
            hc_lower, cn_lower = hc_name.lower(), court_name.lower()
            
            if 'supreme' in hc_lower or 'supreme' in cn_lower:
                c_type = 'Supreme Court'
            elif 'high court' in hc_lower or 'high court' in cn_lower:
                c_type = 'High Court'
            elif 'session' in cn_lower:
                c_type = 'Session Court'
                
            try:
                f_date = pd.to_datetime(row.get('DATE_FILED')).to_pydatetime()
            except:
                f_date = datetime.now() - timedelta(days=random.randint(1, 4000))

            status = str(row.get('CURRENT_STATUS', 'Pending'))
            if not status or status == 'nan': status = 'Pending'

            case = Case(
                case_number=cnr,
                case_type=str(row['CASE_TYPE']),
                title=f"{row['CASE_TYPE']} ({row.get('CASE_NUMBER', 'N/A')})",
                description=f"Automated judicial record. Subject: {row.get('CASETYPE_FULLFORM', 'Legal Matter')}",
                filing_date=f_date,
                urgency='Medium',
                number_of_evidence=int(row.get('Number_of_Evidence', 0) or 0),
                hearing_count=int(row.get('HEARING_COUNT', 0) or 0),
                status=status,
                court_type=c_type,
                court_name=court_name,
                high_court_name=hc_name
            )
            cases_to_create.append(case)
        
        # Batch ML Prediction
        results = ml.predict_batch(cases_to_create)
        for i, (p, s, r) in enumerate(results):
            cases_to_create[i].predicted_priority = p
            cases_to_create[i].priority_score = s
            cases_to_create[i].priority_reasoning = r
            
        # Bulk Insertion
        try:
            Case.objects.insert(cases_to_create, load_bulk=False)
            count += len(cases_to_create)
            print(f"✅ Ingested {count} cases...")
        except Exception as e:
            print(f"Batch Error: {e}")

    print(f"🚀 Mission Accomplished: {count} real-world cases synchronized.")

if __name__ == "__main__":
    populate_real_data()
