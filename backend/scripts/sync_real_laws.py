from app.services.scraper_service import ScraperService
from app.services.impact_service import ImpactService
from mongoengine import connect
import os

def sync_all():
    print("🔄 Starting Real-Time Law Synchronization...")
    
    # Connection (Hardcoded to match app config)
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    
    scraper = ScraperService()
    impactor = ImpactService()
    
    # 1. Fetch Latest Laws
    print("📡 Fetching recent enlistments from PIB/India Code...")
    new_laws = scraper.fetch_recent_enactments()
    print(f"✅ Found {len(new_laws)} legislative items to process.")
    
    # Check cases
    from app.models.case import Case
    case_count = Case.objects.count()
    print(f"📁 Current Case Repository Size: {case_count}")

    # 2. Analyze Impact
    total_impacts = 0
    for law in new_laws:
        print(f"🧠 AI Analyzing impact for: {law.title}")
        count = impactor.analyze_and_apply_impact(law)
        total_impacts += count
        print(f"🔗 Linked to {count} relevant cases.")
        
    print(f"\n✨ Synchronization Complete! {len(new_laws)} laws synced, {total_impacts} impact vectors established.")

if __name__ == "__main__":
    sync_all()
