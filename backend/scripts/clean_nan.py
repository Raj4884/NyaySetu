import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from mongoengine import connect
from app.models.case import Case

def clean():
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    cases = Case.objects(title__icontains='nan')
    count = 0
    for c in cases:
        if 'nan' in c.title.lower():
            c.title = c.title.replace('nan', 'Unknown')
            c.save()
            count += 1
    print(f"Cleaned {count} cases")

if __name__ == "__main__":
    clean()
