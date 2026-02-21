import os
import sys
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from mongoengine import connect
from app.models.law import Law

def cleanup_dummy_laws():
    connect('nyaysetu', host='mongodb://localhost:27017/nyaysetu')
    
    # Real 2026 Laws we want to keep (based on our population script titles)
    real_titles = [
        "Bharatiya Nyaya Sanhita (BNS), 2023",
        "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023",
        "Bharatiya Sakshya Adhiniyam (BSA), 2023",
        "Information Technology Amendment Rules, 2026"
    ]
    
    print("🧹 Cleaning up legacy/dummy legal entries...")
    dummy_laws = Law.objects(title__nin=real_titles)
    count = dummy_laws.count()
    
    for l in dummy_laws:
        print(f"🗑️ Deleting: {l.title}")
        l.delete()
        
    print(f"✅ Cleanup complete. {count} dummy entries removed.")

if __name__ == "__main__":
    cleanup_dummy_laws()
