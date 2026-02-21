import os
import sys
import numpy as np
from mongoengine import connect

# Standardize path
PROJECT_ROOT = "f:/NYAYSETU"
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
sys.path.insert(0, BACKEND_DIR)

from app.models.case import Case
from app.models.user import User # Register User model
from app.services.ml_service import MLService

def mass_prioritize():
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    ml_svc = MLService()
    
    print("🚀 Initializing Mass Prioritization Engine (1.05M records)...")
    
    batch_size = 5000
    total = Case.objects.count()
    processed = 0
    
    # Placeholders to replace
    placeholders = [None, "Semantic analysis in progress...", "AI is calculating..."]
    
    while True:
        # Optimized query for missing rationales
        cases = list(Case.objects(priority_reasoning__in=placeholders).limit(batch_size))
        
        if not cases:
            print("✅ All cases have been prioritized with professional rationales.")
            break
            
        print(f"🔄 Ingesting Batch: {processed} / {total} ({(processed/total*100):.1f}%)")
        
        try:
            predictions = ml_svc.predict_batch(cases)
            
            # Use bulk operations for database performance
            from pymongo import UpdateOne
            bulk_ops = []
            
            for i, case in enumerate(cases):
                priority, score, rationale = predictions[i]
                bulk_ops.append(UpdateOne(
                    {'_id': case.id},
                    {'$set': {
                        'predicted_priority': priority,
                        'priority_score': float(score),
                        'priority_reasoning': rationale,
                        'status': 'Processed'
                    }}
                ))
            
            if bulk_ops:
                Case._get_collection().bulk_write(bulk_ops)
                
            processed += len(cases)
            
            # Monitoring limit for this session (20k cases to avoid long timeouts)
            if processed >= 20000:
                print(f"🕒 Batch limit reached (20,000). Incremental progress saved. JIT API will handle active matters.")
                break
                
        except Exception as e:
            print(f"❌ Batch Processing Error: {e}")
            break

    print(f"📊 Session Complete. {processed} records updated with data-backed judicial insights.")

if __name__ == "__main__":
    mass_prioritize()
