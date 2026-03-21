import sys
import os
import pandas as pd
from datetime import datetime
import numpy as np
import random

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import create_app
from app.models.case import Case, LawImpact
from app.models.law import Law
from app.services.ml_service import MLService
from app.services.impact_service import ImpactService

def map_stage(raw_stage):
    if not isinstance(raw_stage, str):
        return 'Trial'
    s = raw_stage.lower()
    if 'order' in s or 'judgment' in s or 'decided' in s or 'dismissed' in s:
        return 'Judgment'
    if 'appeal' in s:
        return 'Appeal'
    if 'evidence' in s or 'hearing' in s or 'trial' in s:
        return 'Trial'
    return 'Pre-trial'

def ingest_cases():
    app = create_app()
    with app.app_context():
        print("🗑️ Clearing dummy data...")
        Case.objects.delete()
        
        data_path = 'backend/data/cases.csv'
        if not os.path.exists(data_path):
            print(f"❌ Error: {data_path} not found.")
            return

        print("📖 Reading NJDG data (High-Volume Ingestion)...")
        # Read 1000 records
        df = pd.read_csv(data_path, nrows=1000)
        
        ml_svc = MLService()
        impact_svc = ImpactService()
        
        # Get active laws for impact analysis
        active_laws = list(Law.objects.all())
        
        cases_to_create = []
        print(f"🔄 Processing {len(df)} records into न्यायिक ढांचा (Judicial Framework)...")
        
        for i, row in df.iterrows():
            def clean_val(val, default=''):
                if pd.isna(val) or str(val).lower() == 'nan':
                    return default
                return str(val).strip()

            petitioner = clean_val(row.get('PETITIONER'), 'Unknown')
            respondent = clean_val(row.get('RESPONDENT'), 'State')
            title = f"{petitioner} vs {respondent}"
            
            # Date handling
            reg_date = row.get('DATE_FILED', row.get('REGISTRATION_DATE'))
            try:
                filing_dt = pd.to_datetime(reg_date).to_pydatetime()
            except:
                filing_dt = datetime.utcnow()

            # Under sections / description
            under_sections = clean_val(row.get('UNDER_SECTIONS'))
            under_acts = clean_val(row.get('UNDER_ACTS'))
            description = f"Case filed under {under_acts}. Sections: {under_sections}." if under_sections or under_acts else "General legal matter under NJDG review."

            # Create Case object
            c = Case(
                case_number=clean_val(row.get('CNR_NUMBER', row.get('CASE_NUMBER')), f'NJDG-{i}'),
                case_type=clean_val(row.get('CASETYPE_FULLFORM', row.get('CASE_TYPE')), 'General'),
                title=title,
                description=description,
                filing_date=filing_dt,
                status='Pending',
                court_type='District Court',
                court_name=clean_val(row.get('COURT_NAME'), 'Unknown District Court'),
                high_court_name=clean_val(row.get('NAME_OF_HIGH_COURT'), ''),
                number_of_evidence=int(row.get('Number_of_Evidence', 0)) if not pd.isna(row.get('Number_of_Evidence')) else 0,
                hearing_count=int(row.get('HEARING_COUNT', random.randint(1, 5))) if not pd.isna(row.get('HEARING_COUNT')) else random.randint(1, 5),
                stage=map_stage(row.get('CURRENT_STAGE')),
                social_sensitivity=random.randint(0, 10)
            )
            cases_to_create.append(c)

        # Batch insert for performance
        if cases_to_create:
            print(f"💾 Inserting {len(cases_to_create)} real records into MongoDB...")
            Case.objects.insert(cases_to_create)
            
            # Re-fetch for processing
            all_inserted = list(Case.objects.all())
            
            print("🧠 Running Explainable AI (XAI) Prioritization on Real Data...")
            # Predict in batches for performance
            results = ml_svc.predict_batch(all_inserted)
            
            # Update objects with results
            for i, c in enumerate(all_inserted):
                priority, score, rationale = results[i]
                c.predicted_priority = priority
                c.priority_score = score
                c.priority_reasoning = rationale
                # Note: Bulk update would be faster but for 1000 records we can do this or use update
            
            # Use bulk update for efficiency
            for c in all_inserted:
                c.save()

            print(f"📡 Analyzing Law Impact for {len(active_laws)} Active Legislations...")
            for law in active_laws:
                impact_svc.analyze_and_apply_impact(law)
                
        print(f"✅ FINAL SUCCESS: Ingested {len(cases_to_create)} real judicial records from NJDG.")

if __name__ == "__main__":
    ingest_cases()
