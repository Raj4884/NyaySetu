import sys
import os
from datetime import datetime, timedelta
import random

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import create_app
from app.models.case import Case, LawImpact
from app.models.law import Law
from app.services.impact_service import ImpactService
from app.services.nlp_service import NLPService

def seed_data():
    app = create_app()
    with app.app_context():
        # Clear existing data for a fresh start
        Case.objects.delete()
        Law.objects.delete()
        
        print("🌱 Seeding Real-World Legal Data...")
        
        nlp = NLPService()
        impact_svc = ImpactService()
        
        # 1. Create a "New Law" (The Amendment)
        print("Creating New Statutory Amendments...")
        bail_reform = Law(
            title="Criminal Procedure (Bail Reform) Amendment Act 2024",
            description="An amendment to CrPC regarding Section 41A arrest procedures and notice requirements.",
            full_text="""
            AN ACT further to amend the Code of Criminal Procedure. 
            Section 41A is hereby amended to mandate immediate notice before arrest in all non-heinous offenses.
            Provided that where the accused complies with the notice, no arrest shall be made unless recorded for reasons.
            This amendment aims to reduce unnecessary pretrial custody and align with Article 21 rights.
            """,
            lawyer_summary="Mandatory Section 41A compliance. Notice is now a prerequisite for arrest in non-heinous crimes, shifting the burden to the state to justify custody.",
            citizen_summary="The government has made it harder for police to arrest people for smaller crimes. They must now give you a 'Section 41A notice' first, protecting your right to liberty.",
            category="Criminal",
            sections=["Section 41A", "Article 21"],
            effective_date=datetime.utcnow()
        )
        bail_reform.save()

        # 2. Create Realistic Cases
        print("Populating Judicial Docket...")
        
        cases_data = [
            {
                "case_number": "CRA/450/2022",
                "title": "State of Maharashtra vs. Rajesh Kumar",
                "description": "Criminal appeal regarding unauthorized protest. Accused has been in custody for 14 months without trial. Potential violation of Section 41A guidelines.",
                "case_type": "Criminal",
                "court_type": "High Court",
                "court_name": "Bombay High Court",
                "urgency": "High",
                "number_of_evidence": 12,
                "hearing_count": 8,
                "stage": "Appeal",
                "social_sensitivity": 7,
                "filing_date": datetime.utcnow() - timedelta(days=500)
            },
            {
                "case_number": "CS/1029/2023",
                "title": "Global Tech Solutions vs. Local Innovators Pvt Ltd",
                "description": "Intellectual property dispute. Application for urgent injunction filed to stay the release of competing software. High commercial stakes involved.",
                "case_type": "Technology",
                "court_type": "District Court",
                "court_name": "Delhi District Court",
                "urgency": "Medium",
                "number_of_evidence": 45,
                "hearing_count": 2,
                "stage": "Trial",
                "social_sensitivity": 4,
                "filing_date": datetime.utcnow() - timedelta(days=120)
            },
            {
                "case_number": "LCA/55/2021",
                "title": "Workers Union vs. Industrial Conglomerate",
                "description": "Labour dispute regarding mass layoffs during restructuring. Affects livelihoods of 500+ families. Public interest litigation elements.",
                "case_type": "Labour",
                "court_type": "High Court",
                "court_name": "Karnataka High Court",
                "urgency": "High",
                "number_of_evidence": 150,
                "hearing_count": 15,
                "stage": "Appeal",
                "social_sensitivity": 9,
                "filing_date": datetime.utcnow() - timedelta(days=800)
            },
            {
                "case_number": "BA/99/2024",
                "title": "Amit Shah (Accused) vs. State",
                "description": "Urgent Bail Application. Accused arrested under Section 41A non-compliance allegations. Involves interpretation of new 2024 Bail Reform Act.",
                "case_type": "Bail",
                "court_type": "Session Court",
                "court_name": "Patiala House Court",
                "urgency": "High",
                "number_of_evidence": 5,
                "hearing_count": 1,
                "stage": "Pre-trial",
                "social_sensitivity": 6,
                "filing_date": datetime.utcnow() - timedelta(days=15)
            }
        ]

        created_cases = []
        for d in cases_data:
            c = Case(**d)
            # Run initial priority prediction (simulated)
            # In a real app, we'd call the ML service, but for seeding, we let the app logic handle it or set manually
            c.save()
            created_cases.append(c)

        # 3. Trigger Proactive Law Impact Analysis
        print("Running Proactive Law Impact Analysis on New Laws...")
        impact_svc.analyze_and_apply_impact(bail_reform)

        print("✅ Seeding Complete! System is now live with real-world scenarios.")

if __name__ == "__main__":
    seed_data()
