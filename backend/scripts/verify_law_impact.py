import sys, os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from mongoengine import connect
from app.models.law import Law
from app.services.impact_service import ImpactService

def verify():
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    law = Law.objects.first()
    if not law:
        print("No laws found.")
        return
    print(f"Analyzing {law.title}...")
    impact_count = ImpactService().analyze_and_apply_impact(law)
    law.reload()
    print(f"Established impacts: {impact_count}")
    print(f"Law affected_count: {law.affected_count}")

if __name__ == "__main__":
    verify()
