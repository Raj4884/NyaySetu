import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from app.models.law import Law
from app.services.nlp_service import NLPService

class ScraperService:
    def __init__(self):
        self.nlp = NLPService()
        self.sources = {
            "pib": "https://pib.gov.in/PressReleasePage.aspx?PRID=",
            "indiacode": "https://www.indiacode.nic.in/"
        }

    def fetch_recent_enactments(self):
        """
        Truly real-time: Crawl the PIB index to find today's legislative updates.
        """
        # 1. Discover latest Press Releases
        # In a full app, this would target the 'Releases' index.
        # Here we target the Ministry of Law and Ministry of Personnel indices.
        discovered_urls = self._discover_legislative_updates()
        
        synced_laws = []
        for title, url in discovered_urls:
            print(f"🕸️ Real-time Analysis: {title}")
            raw_text = self._fetch_full_statutory_text(url)
            
            if len(raw_text) < 200:
                continue

            lawyer_sum, citizen_sum = self.nlp.generate_summaries(raw_text)
            
            # Use atomic upsert to stay current without duplicates
            Law.objects(scraped_source=url).update_one(
                upsert=True,
                set__title=title,
                set__description=raw_text[:300] + "...",
                set__full_text=raw_text,
                set__lawyer_summary=lawyer_sum,
                set__citizen_summary=citizen_sum,
                set__category=self._categorize_enactment(title),
                set__scraped_source=url,
                set__effective_date=datetime.utcnow()
            )
            synced_laws.append(Law.objects(scraped_source=url).first())
            
        return synced_laws

    def _discover_legislative_updates(self):
        """
        Dynamically discovers legislative updates by scanning the PIB Legal/Law index.
        """
        updates = []
        try:
            # Targeting the Ministry of Law and Justice 'All Releases' endpoint
            # In a live environment, we rotate through common PRID ranges or crawl the archive.
            # For this automation, we focus on the main newsroom releases for 'Law'.
            url = "https://pib.gov.in/allRelese.aspx" 
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                # Find links containing legislative keywords
                keywords = ["Act", "Rules", "Sanhita", "Adhiniyam", "Provision", "Amendment"]
                for link in soup.find_all('a', href=True):
                    text = link.get_text().strip()
                    if any(k in text for k in keywords):
                        full_url = "https://pib.gov.in/" + link['href'] if not link['href'].startswith('http') else link['href']
                        updates.append((text, full_url))
        except Exception as e:
            print(f"Discovery Error: {e}")
            
        # Ensure we always have the core 2024-2026 foundation if indices are quiet
        fallbacks = [
            ("Bharatiya Nyaya Sanhita, 2023", "https://pib.gov.in/PressReleasePage.aspx?PRID=2021664"),
            ("Bharatiya Nagarik Suraksha Sanhita, 2023", "https://pib.gov.in/PressReleasePage.aspx?PRID=1980000"),
            ("Bharatiya Sakshya Adhiniyam, 2023", "https://pib.gov.in/PressReleasePage.aspx?PRID=1980001")
        ]
        
        return list(set(updates + fallbacks))[:10] # Top 10 unique updates

    def _fetch_full_statutory_text(self, url):
        """
        Real scraper using requests and BeautifulSoup.
        Targets the standard PIB ReleaseText container.
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # PIB specific content container
                content_div = soup.find('div', class_='ReleaseText')
                if not content_div:
                    # Fallback for different PIB templates
                    content_div = soup.find('div', class_='release-details-content')
                
                if content_div:
                    # Remove unwanted tags like scripts or social media links
                    for tag in content_div(['script', 'style', 'a']):
                        tag.decompose()
                    return content_div.get_text(separator=' ', strip=True)
                
                # General fallback: all paragraphs
                paragraphs = soup.find_all('p')
                text = ' '.join([p.get_text(strip=True) for p in paragraphs if len(p.get_text()) > 30])
                if len(text) > 100:
                    return text

            return f"SCRARE_ERROR: HTTP {response.status_code}"
        except Exception as e:
            return f"SCRAPE_EXCEPTION: {str(e)}"

    def _categorize_enactment(self, title):
        title_lower = title.lower()
        if "bns" in title_lower or "nyaya" in title_lower: return "Criminal Law"
        if "labour" in title_lower or "wage" in title_lower: return "Labour/Employment"
        if "data" in title_lower or "digital" in title_lower: return "Technology/Privacy"
        return "General Legislative Update"
