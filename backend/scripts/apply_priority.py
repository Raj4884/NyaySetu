import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import create_app
from app.models.case import Case
from app.services.ml_service import MLService

def apply_priority():
    app = create_app()
    with app.app_context():
        print("🧠 Initializing ML Service (Loading newly trained model)...")
        ml_svc = MLService()
        
        all_cases = list(Case.objects.all())
        total = len(all_cases)
        
        print(f"🔄 Applying Global Reprioritization to {total} cases...")
        
        # Predict in batch for maximum efficiency
        results = ml_svc.predict_batch(all_cases)
        
        print("💾 Updating database records...")
        for i, case in enumerate(all_cases):
            priority, score, rationale = results[i]
            
            # Direct update to avoid collision or slow saves
            Case.objects(id=case.id).update_one(
                set__predicted_priority=priority,
                set__priority_score=score,
                set__priority_reasoning=rationale,
                set__status='Processed'
            )
            
            if (i + 1) % 100 == 0:
                print(f"✅ Processed {i + 1}/{total} cases...")
                
        print(f"🚀 SUCCESS: All {total} cases have been prioritized using the production 1M+ model.")

if __name__ == "__main__":
    apply_priority()
