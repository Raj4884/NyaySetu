import sys
import os
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import create_app
from app.models.law import Law
from app.services.impact_service import ImpactService

def seed_diverse_laws():
    app = create_app()
    with app.app_context():
        print("⚖️ Seeding Diverse Legal Amendments (SRS Alignment)...")
        
        impact_svc = ImpactService()
        
        laws_data = [
            {
                "title": "Digital Personal Data Protection (Compliance) Rules 2024",
                "description": "Rules governing the processing of personal data and rights of data principals in judicial proceedings.",
                "full_text": """
                In exercise of powers conferred by Section 40 of the DPDP Act. 
                Rule 5: Any judicial matter involving unauthorized data access must prioritize 'Right to Correction'.
                Rule 12: Evidence involving personal digital identifiers must be authenticated via verified consent tokens.
                Impact: This affects all technology and privacy-related litigation.
                """,
                "lawyer_summary": "New evidentiary requirements for digital identifiers. Mandatory verification under Rule 12 for all IP and Data Breach cases to ensure compliance with privacy norms.",
                "citizen_summary": "A new rule protects your digital information in court. If a case involves your data, the court must now double-check how that data was collected.",
                "category": "Technology",
                "sections": ["Section 40", "Rule 5", "Rule 12"],
                "effective_date": datetime.utcnow()
            },
            {
                "title": "Code on Social Security (Gig Workers Amendment) 2024",
                "description": "Extended protection and benefit framework for platform and gig workers under the Social Security Code.",
                "full_text": """
                Section 114: Defines 'Platform Workers' to include delivery and ride-sharing partners.
                Section 115: Mandatory contribution to social security fund by aggregators in pending disputes.
                Proviso: Ongoing labour disputes involving aggregator platforms shall be re-evaluated under this expanded definition.
                """,
                "lawyer_summary": "Extends labour protection to platform workers. Aggregators are now liable for social security contributions even during the pendency of litigation under Section 115.",
                "citizen_summary": "Workers in apps like Zomato or Ola now have better rights. If they are in a court case with the company, the company might have to pay for their social security now.",
                "category": "Labour",
                "sections": ["Section 114", "Section 115"],
                "effective_date": datetime.utcnow()
            },
            {
                "title": "Civil Procedure (Commercial Injunction) Guidelines 2024",
                "description": "Supreme Court directed guidelines for expedited disposal of interim injunction applications in high-value commercial suits.",
                "full_text": """
                Guideline III: Interim injunctions in commercial matters must be decided within 30 days of filing.
                Guideline V: Order 39 Rule 1 matches must favor status quo where irreparable injury is prima facie evident.
                Impact: High-value commercial suits involving stay orders are prioritized.
                """,
                "lawyer_summary": "Expedited timeline for Order 39 (Injunctions). Courts are now mandated under Guideline III to provide a decision on interim relief within a strict 30-day window.",
                "citizen_summary": "If you have a business fight in court and asked for a 'stay order', the court now has to decide on that request within 30 days.",
                "category": "Civil",
                "sections": ["Order 39", "Rule 1", "Guideline III"],
                "effective_date": datetime.utcnow()
            }
        ]

        for ld in laws_data:
            # Avoid duplicates
            if not Law.objects(title=ld['title']).first():
                law = Law(**ld)
                law.save()
                print(f"✅ Added: {law.title}")
                print(f"📡 Triggering Proactive Impact Analysis for {law.title}...")
                impact_svc.analyze_and_apply_impact(law)
            else:
                print(f"⏩ Skipping (Already Exists): {ld['title']}")

        print("\n🚀 All new legislations are now active and linked to relevant NJDG cases.")

if __name__ == "__main__":
    seed_diverse_laws()
