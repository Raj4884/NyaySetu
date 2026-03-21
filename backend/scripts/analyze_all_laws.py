import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import create_app
from app.models.case import Case
from app.models.law import Law
from app.services.impact_service import ImpactService

def analyze_all():
    app = create_app()
    with app.app_context():
        print("🏛️ Starting Global Law Impact Analysis (1,000 cases x All Laws)...")
        impactor = ImpactService()
        
        # Clear existing impact reports to avoid duplication if running manually
        Case.objects.all().update(set__impact_reports=[])
        
        all_laws = Law.objects.all()
        total_impacts = 0
        
        for law in all_laws:
            print(f"📡 Processing: {law.title}")
            count = impactor.analyze_and_apply_impact(law)
            print(f"   ✅ Established {count} real impacts.")
            total_impacts += count
            
        print(f"\n🚀 SUCCESS: Global Analysis complete. Total of {total_impacts} impact alerts established across the dataset.")

if __name__ == "__main__":
    analyze_all()
