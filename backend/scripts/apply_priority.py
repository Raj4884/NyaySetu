import os
import sys

# Standardize path
PROJECT_ROOT = "f:/NYAYSETU"
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
sys.path.insert(0, BACKEND_DIR)

print(f"DEBUG: PYTHONPATH: {sys.path[:3]}")

import numpy as np
from mongoengine import connect

try:
    from app.models.user import User
    from app.models.case import Case
    from app.services.ml_service import MLService
    print("✅ Core imports successful.")
except ImportError as e:
    print(f"❌ Critical Import Error: {e}")
    # Try one more fallback: absolute import if cwd is backend
    try:
        from models.case import Case
        from services.ml_service import MLService
        print("✅ Fallback imports successful.")
    except ImportError:
        sys.exit(1)

def apply_priority_all():
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    ml_svc = MLService()
    
    print("🚂 Starting mass prioritization application...")
    
    total = Case.objects.count()
    # Find cases that have the placeholder reasoning
    placeholder = "Semantic analysis in progress..."
    cases_todo = Case.objects(priority_reasoning__in=[None, placeholder])
    
    count_todo = cases_todo.count()
    print(f"📊 Total Cases: {total} | Needs Update: {count_todo}")
    
    if count_todo == 0:
        print("✅ No cases require update.")
        return

    batch_size = 100
    processed = 0
    
    while True:
        current_batch = list(Case.objects(priority_reasoning__in=[None, placeholder]).limit(batch_size))
        if not current_batch:
            break
            
        print(f"🔄 Processing batch: {processed} / {count_todo}")
        predictions = ml_svc.predict_batch(current_batch)
        
        for i, case in enumerate(current_batch):
            priority, score, rationale = predictions[i]
            # Use specific update to avoid potential race conditions or overwriting other fields
            Case.objects(id=case.id).update_one(
                set__predicted_priority=priority,
                set__priority_score=score,
                set__priority_reasoning=rationale,
                set__status='Processed'
            )
        
        processed += len(current_batch)
        if processed >= 1000: # Just do 1k for now to verify, rest can be done in background/later
            break

    print(f"✅ Priority application verification phase complete.")

if __name__ == "__main__":
    apply_priority_all()
