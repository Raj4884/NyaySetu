from app.models.law import Law
from app.models.case import Case, LawImpact
import re

class ImpactService:
    def __init__(self):
        # Keywords to Case Type mapping (including Indian court abbreviations)
        self.type_mapping = {
            "Criminal": ["bns", "bharatiya nyaya sanhita", "penal", "crime", "sexual", "theft", "murder", "state", "bailc", "crim", "sess", "cr", "aba", "a.b.a.", "mcrca", "saba", "cri"],
            "Labour": ["labour", "pension", "worker", "employment", "maternity", "gig", "wage", "industrial", "lab"],
            "Technology": ["privacy", "data", "digital", "protection", "consent", "breach", "fiduciary", "cyber", "quantum", "ai"],
            "Commercial": ["space", "satellite", "liability", "contract", "commercial", "corporation", "com", "comm", "co"],
            "Civil": ["inheritance", "estate", "gender", "succession", "sample", "individual", "property", "judicial", "cs", "os", "civil", "adj", "rc", "mca", "arca"]
        }

    def analyze_and_apply_impact(self, law):
        """
        Analyzes a law and applies its impact to all relevant cases in the DB using bulk updates.
        """
        # Determine relevant case types based on law content
        relevant_types = []
        law_content = (law.title + " " + law.full_text).lower()
        
        for case_type, keywords in self.type_mapping.items():
            if any(kw in law_content for kw in keywords):
                relevant_types.append(case_type)
        
        if not relevant_types:
            relevant_types = ["Criminal", "Civil", "Commercial"] # Broad fallback

        from mongoengine.queryset.visitor import Q
        query = Q()
        matched_any = False
        
        for case_type, keywords in self.type_mapping.items():
            # If the law belongs to this category (e.g., Criminal)
            if any(kw in law_content for kw in keywords):
                matched_any = True
                # Find cases starting with any of the category's keywords (e.g. BAILC, ABA)
                # We use IIn (Case-insensitive In) or multiple IContains
                for kw in keywords:
                    # Only add code-based keywords, not generic ones like 'state' or 'sample'
                    if len(kw) <= 5 or kw in ['bailc', 'mcrca', 'sess', 'crim']:
                         query |= Q(case_type__iexact=kw)
        
        if not matched_any:
            # Fallback to generic if no specific category matched
            query = Q(case_type__icontains="Criminal") | Q(case_type__icontains="Civil")

        matching_cases = Case.objects(query)
        match_count = matching_cases.count()

        if match_count > 0:
            # Create LawImpact report entry with XAI Rationale
            impact_entry = LawImpact(
                precedent_title=law.title,
                source=law.scraped_source or "Official Gazette",
                relevance_score=0.9,
                url=law.scraped_source,
                impact_explanation=self._generate_impact_rationale(law, None) # Rationale based on law type
            )
            
            # Bulk update: Add to impact_reports if not already present
            matching_cases.update(add_to_set__impact_reports=impact_entry)
            
            # Boost priority if law is significant
            if "BNS" in law.title or "Data Protection" in law.title:
                matching_cases.update(
                    set__urgency='High',
                    set__predicted_priority='High',
                    set__priority_reasoning=f"Priority elevated due to immediate compliance requirements under {law.title}."
                )

            # Link cases back to the law (we store IDs)
            # For 923k cases, we shouldn't store all IDs in the Law document as it might exceed 16MB limit
            # Instead, we just store the count or a sample of IDs.
            law.affecting_cases = [str(c.id) for c in matching_cases[:100]] # Store sample IDs
            law.save()
            
        return match_count

    def _generate_impact_rationale(self, law, case):
        """
        AI-simulated rationale generator.
        In production, this would use a LLM prompt.
        """
        if "BNS" in law.title:
            return f"This case now falls under the procedural reforms of BNS 2023, requiring mandatory digital evidence logging and revised sentencing guidelines."
        elif "Labour" in law.title:
            return f"New non-discrimination and gig worker protections under the 2024 Act may alter the liability profile of the respondent."
        elif "Data Protection" in law.title:
            return f"Evidentiary standards for data handling and consent must now be verified against the 2024 DPDP Rules."
        
        return f"Legal standing and procedural timelines are impacted by the newly enacted statutory framework of {law.title}."
