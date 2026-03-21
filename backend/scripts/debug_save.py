import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app import create_app
from app.models.case import Case

app = create_app()
with app.app_context():
    c = Case.objects.first()
    if c:
        print(f"Testing save on case: {c.case_number}")
        try:
            c.save()
            print("✅ Save successful.")
        except Exception as e:
            print(f"❌ Save failed: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("No cases found.")
