import os
import sys

PROJECT_ROOT = "f:/NYAYSETU"
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from mongoengine import connect
from app.models.case import Case
from app.models.user import User

def debug_db():
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    
    total = Case.objects.count()
    print(f"Total Cases: {total}")
    
    u = User.objects(username='RAKHI').first()
    if u:
        print(f"User RAKHI found: {u.id}, role: {u.role}")
        linked = Case.objects(citizen=u).count()
        print(f"Cases linked via citizen field: {linked}")
        
        # Check first linked case
        c = Case.objects(citizen=u).first()
        if c:
            print(f"Sample linked case: {c.case_number}")
            print(f"Citizen field value: {c.citizen}")
            print(f"Is citizen None? {c.citizen is None}")
            
    # Check general stakeholder count
    st_count = Case.objects(citizen__ne=None).count()
    print(f"Cases where citizen is not None: {st_count}")
    
    st_count_all = Case.objects(__raw__={'$or': [{'lawyer': {'$ne': None}}, {'citizen': {'$ne': None}}]}).count()
    print(f"Cases with any stakeholder (Raw): {st_count_all}")

if __name__ == "__main__":
    debug_db()
