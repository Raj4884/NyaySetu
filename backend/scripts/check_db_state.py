from mongoengine import connect
from app.models.case import Case
from app.models.law import Law

def check_state():
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    case_count = Case.objects.count()
    law_count = Law.objects.count()
    
    print(f"📊 Database Stats:")
    print(f" - Total Cases: {case_count}")
    print(f" - Total Laws: {law_count}")
    
    for l in Law.objects:
        print(f"⚖️ Law: {l.title}")
        print(f" 🔗 Affected Cases Count: {len(l.affecting_cases)}")
        
    for c in Case.objects[:3]:
        print(f"📁 Case: {c.title}")
        print(f" 📑 Impacts Registered: {len(c.impact_reports)}")

if __name__ == "__main__":
    check_state()
