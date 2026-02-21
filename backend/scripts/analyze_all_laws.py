from mongoengine import connect
connect(host='mongodb://localhost:27017/nyaysetu_db')

from app.models.law import Law
from app.services.impact_service import ImpactService

def analyze_all_laws():
    
    laws = Law.objects()
    print(f"Found {laws.count()} laws to analyze.")
    
    impact_svc = ImpactService()
    total_impacts = 0
    
    for law in laws:
        print(f"Processing: {law.title}")
        count = impact_svc.analyze_and_apply_impact(law)
        total_impacts += count
        print(f"DONE: {law.title}: {count} impacts found.")
        
    print(f"Mission complete! Total judicial impacts: {total_impacts}")

if __name__ == "__main__":
    analyze_all_laws()
