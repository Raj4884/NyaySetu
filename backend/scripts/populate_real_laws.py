import os
import sys
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import requests
from bs4 import BeautifulSoup
from mongoengine import connect
from app.models.law import Law
from app.services.nlp_service import NLPService
from datetime import datetime

# Connection to MongoDB
connect(host='mongodb://localhost:27017/nyaysetu_db')

def scrape_real_laws():
    """
    Automated Judicial Statute Scraper for 2026.
    Uses ScraperService to discover and ingest latest acts/rules.
    """
    print("🚀 Initializing Automated 2026 Legal Gazette Scraper...")
    
    from app.services.scraper_service import ScraperService
    from app.services.impact_service import ImpactService
    
    scraper = ScraperService()
    impactor = ImpactService()
    
    print("🕸️ Crawling official indices (PIB / India Code)...")
    new_laws = scraper.fetch_recent_enactments()
    
    if not new_laws:
        print("⚠️ No new enactments discovered in current cycle.")
        return

    print(f"✅ Discovered {len(new_laws)} legislative updates.")
    
    for law in new_laws:
        print(f"⚖️ Analyzing case impact for: {law.title}")
        impact_count = impactor.analyze_and_apply_impact(law)
        print(f"   -> Established {impact_count} semantic linkages.")

if __name__ == "__main__":
    scrape_real_laws()

if __name__ == "__main__":
    scrape_real_laws()
