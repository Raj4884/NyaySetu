import sys
import os
sys.path.append(os.getcwd())

from app.services.ml_service import MLService
from app.models.case import Case
from datetime import datetime

from datetime import datetime, timedelta

def test():
    ml = MLService()
    now = datetime.utcnow()
    test_data = [
        ('Criminal', 20, 10, now - timedelta(days=1200)), # High: Crim + Dense + Old
        ('Civil', 1, 1, now - timedelta(days=100)),       # Low/Med: Civil + Sparse + New
        ('BAILC', 0, 0, now - timedelta(days=10)),        # Low: New + No activity
        ('OS', 5, 2, now - timedelta(days=800))           # Med: OS + Moderate activity + Old
    ]
    
    print(f"{'Type':<10} | {'E':<3} | {'H':<3} | {'Wait':<5} | {'Priority':<8} | {'Score':<6}")
    print("-" * 60)
    
    for ctype, e, h, fdate in test_data:
        c = Case(case_type=ctype, number_of_evidence=e, hearing_count=h, filing_date=fdate)
        p, s, r = ml.predict(c)
        wait_yrs = (now - fdate).days / 365.25
        print(f"{ctype:<10} | {e:<3} | {h:<3} | {wait_yrs:<5.1f} | {p:<8} | {s:<6.2f}")
    
if __name__ == "__main__":
    test()
