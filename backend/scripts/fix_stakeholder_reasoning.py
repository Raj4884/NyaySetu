import os
import sys

PROJECT_ROOT = "f:/NYAYSETU"
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from mongoengine import connect
from app.models.case import Case
from app.models.user import User
from app.services.ml_service import MLService

def fix_stakeholder_cases():
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    ml_svc = MLService()
    
    # 1. Target cases with ANY stakeholder (lawyer or citizen)
    raw_query = {'$or': [{'lawyer': {'$ne': None}}, {'citizen': {'$ne': None}}]}
    stakeholder_cases = list(Case.objects(__raw__=raw_query))
    
    print(f"🎯 Targeting {len(stakeholder_cases)} stakeholder-linked cases...")
    
    if not stakeholder_cases:
        print("❌ No stakeholder cases found. Something is wrong with the linkage.")
        return

    predictions = ml_svc.predict_batch(stakeholder_cases)
    
    for i, case in enumerate(stakeholder_cases):
        priority, score, rationale = predictions[i]
        Case.objects(id=case.id).update_one(
            set__predicted_priority=priority,
            set__priority_score=float(score),
            set__priority_reasoning=rationale,
            set__status='Processed'
        )
        print(f"✅ Updated Case {case.case_number}: {priority} | {rationale[:50]}...")

    print(f"🚀 Successfully processed {len(stakeholder_cases)} priority cases for users.")

if __name__ == "__main__":
    fix_stakeholder_cases()
