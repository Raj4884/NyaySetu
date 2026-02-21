from app.models.law import Law
from app.models.user import User  # Import User before Case
from app.models.case import Case, LawImpact
from app.models.notification import Notification
from app.services.nlp_service import NLPService
from app.services.email_service import EmailService
import numpy as np
import re

class ImpactService:
    def __init__(self):
        self.nlp = NLPService()
        self.type_mapping = {
            "Criminal": ["bns", "bharatiya nyaya sanhita", "penal", "crime", "bailc", "sess", "aba", "a.b.a.", "mcrc", "mcrca", "cri", "criminal"],
            "Labour": ["labour", "pension", "worker", "employment", "maternity", "gig", "wage"],
            "Technology": ["privacy", "data", "digital", "protection", "consent", "breach", "cyber", "ai", "ethics"],
            "Commercial": ["contract", "commercial", "corporation", "comm", "co"],
            "Civil": ["inheritance", "property", "civil", "cs", "os", "adj", "rc", "mca", "arca"]
        }

    def analyze_and_apply_impact(self, law):
        """
        Analyzes a law using semantic similarity AND citation mapping.
        """
        law_text = f"{law.title} {law.full_text}"
        law_embedding = np.array(self.nlp.get_embeddings(law_text))
        
        # 1. Broad Category Filtering
        relevant_keywords = []
        for cat, kws in self.type_mapping.items():
            if any(kw in law_text.lower() for kw in kws):
                relevant_keywords.extend([kw.upper() for kw in kws])
        
        if not relevant_keywords:
            relevant_keywords = ["CRIM", "SESS", "BAIL", "MCRC", "CRIMINAL"] # Broad Criminal Fallbacks
        
        from mongoengine.queryset.visitor import Q
        
        # Use raw query to bypass any MongoEngine Q mapping issues for ReferenceFields
        raw_stakeholder_query = {'$or': [{'lawyer': {'$ne': None}}, {'citizen': {'$ne': None}}]}
        print(f"DEBUG: Internal Case Count: {Case.objects.count()}")
        
        print(f"DEBUG: Relevant Keywords for Law Impact: {relevant_keywords}")
        
        # Build a consolidated keyword query for partial matching
        keyword_filter = Q()
        for kw in relevant_keywords[:8]: # Increase coverage
            keyword_filter |= Q(case_type__icontains=kw)
            keyword_filter |= Q(title__icontains=kw)
            
        # Use __exists for ReferenceFields to find cases with any stakeholder
        stakeholder_cases = Case.objects(Q(citizen__exists=True) | Q(lawyer__exists=True)).only('id').limit(1000)
        stakeholder_ids = [str(c.id) for c in stakeholder_cases]
        print(f"DEBUG: Found {len(stakeholder_ids)} potential stakeholder IDs using __exists.")
        
        # Then, filter these by the keyword query
        # RELAXATION: For stakeholder cases, we check them regardless of keyword filter if no keyword matches
        # This ensures real users get alerts for their cases if the law is broad.
        matching_cases = Case.objects(id__in=stakeholder_ids).filter(keyword_filter).limit(1000)
        
        if matching_cases.count() == 0 and stakeholder_ids:
            print("DEBUG: No stakeholder cases matched keywords. Falling back to all stakeholder cases.")
            matching_cases = Case.objects(id__in=stakeholder_ids).limit(1000)
        
        print(f"DEBUG: Found {matching_cases.count()} STAKEHOLDER cases for analysis.")
        
        # If no stakeholders found, fall back to general sample for analytics
        if matching_cases.count() == 0:
            matching_cases = Case.objects(keyword_filter).limit(100)
            print(f"DEBUG: Falling back to {matching_cases.count()} general cases.")
        
        # ---------------------------------------------------------
        # SPAM PREVENTION: GROUP ALERTS BY USER
        # ---------------------------------------------------------
        user_alerts = {} # {user_id: {'user': User, 'cases': [Case], 'role': 'citizen'|'lawyer'}}
        
        impact_count = 0
        for case in matching_cases:
            case_text = f"{case.title} {case.description or ''}"
            case_embedding = np.array(self.nlp.get_embeddings(case_text))
            
            # Semantic Similarity
            similarity = np.dot(law_embedding, case_embedding) / (
                np.linalg.norm(law_embedding) * np.linalg.norm(case_embedding) + 1e-9
            )
            
            print(f"DEBUG: Case {case.case_number} | Sim: {similarity:.4f}")
            citation_match = self._check_citations(law_text, case_text)
            
            # Final Match Criteria (Methodology Step 4)
            is_stakeholder = case.lawyer is not None or case.citizen is not None
            base_threshold = 0.10 if is_stakeholder else 0.50
            high_threshold = 0.25 if is_stakeholder else 0.70
            med_threshold = 0.18 if is_stakeholder else 0.55
            
            if (citation_match and similarity > (base_threshold/2)) or similarity > base_threshold:
                if similarity > high_threshold or (citation_match and similarity > med_threshold):
                    impact_level = 'High'
                elif similarity > med_threshold:
                    impact_level = 'Medium'
                else:
                    impact_level = 'Low'

                impact_entry = LawImpact(
                    precedent_title=law.title,
                    precedent_citation=self._extract_citation(law.full_text),
                    source=law.scraped_source or "Official Gazette India",
                    relevance_score=float(similarity),
                    impact_level=impact_level,
                    url=law.scraped_source,
                    impact_explanation=self._generate_impact_rationale(law, case)
                )
                
                Case.objects(id=case.id).update_one(add_to_set__impact_reports=impact_entry)
                law.update(add_to_set__affecting_cases=str(case.id))
                
                # Queue alerts instead of sending immediately
                if case.lawyer:
                    uid = str(case.lawyer.id)
                    if uid not in user_alerts:
                        user_alerts[uid] = {'user': case.lawyer, 'cases': [], 'role': 'lawyer'}
                    user_alerts[uid]['cases'].append(case)

                if case.citizen:
                    uid = str(case.citizen.id)
                    if uid not in user_alerts:
                        user_alerts[uid] = {'user': case.citizen, 'cases': [], 'role': 'citizen'}
                    user_alerts[uid]['cases'].append(case)

                if impact_level == 'High':
                    Case.objects(id=case.id).update_one(
                        set__urgency='High',
                        set__predicted_priority='High',
                        set__priority_reasoning=f"AUTOMATED PRIORITY: Critical legal realignment due to {law.title}."
                    )
                impact_count += 1

        # ---------------------------------------------------------
        # BATCH DISPATCH: ONE ALERT PER USER PER LAW
        # ---------------------------------------------------------
        email_svc = EmailService()
        for uid, data in user_alerts.items():
            user = data['user']
            impacted_cases = data['cases']
            role = data['role']
            
            count = len(impacted_cases)
            case_list = ", ".join([c.case_number for c in impacted_cases[:3]])
            if count > 3:
                case_list += f" and {count - 3} others"
                
            msg = f"A new law has been found that impacts {count} of your cases (including {case_list})."
            
            Notification(
                user=user,
                title=f"⚖️ Statutory Impact: {law.title}",
                message=msg,
                type='LawImpact',
                link_to_id=str(law.id)
            ).save()
            
            # AUTOMATED EMAIL DISABLED (User Preference: Send after login/on-demand)
            # email_svc.send_law_impact_email(
            #     user_email=user.email,
            #     user_name=user.full_name or user.username,
            #     law_title=law.title,
            #     impact_rationale=f"{msg}\n\n{law.lawyer_summary if role == 'lawyer' else law.citizen_summary}",
            #     role=role
            # )

        # Notify Judges (Batch once per run)
        judges = User.objects(role='judge')
        for judge in judges:
            Notification(
                user=judge,
                title=f"🏛️ Judicial Realignment: {law.title}",
                message=f"Administrative alignment triggered for {impact_count} cases in this run.",
                type='LawImpact',
                link_to_id=str(law.id)
            ).save()

        law.affecting_cases = [str(c.id) for c in matching_cases[:10]]
        law.save()
            
        return impact_count

    def _check_citations(self, law_text, case_text):
        """
        Citation matching for legal entities.
        """
        law_text = law_text.lower()
        case_text = case_text.lower()
        
        # BNS/IPC Cross-Mapping
        if ("bns" in law_text or "2023" in law_text) and "ipc" in case_text:
            return True
        if ("bnss" in law_text or "2023" in law_text) and "crpc" in case_text:
            return True
            
        # Common Statutory Markers
        markers = ['constitution', 'it act', 'evidence act', 'penal code']
        for marker in markers:
            if marker in law_text and marker in case_text:
                return True
        return False

    def _extract_citation(self, text):
        """
        Real extraction of Act numbers or Citations using regex.
        """
        match = re.search(r'Act No\. \d+ of \d{4}', text)
        if match:
            return match.group(0)
        
        match = re.search(r'No\. \d+/\d{4}', text)
        if match:
            return f"Gazette {match.group(0)}"
            
        return "Statutory Enactment 2024"

    def _generate_impact_rationale(self, law, case):
        """
        Generates a conversational, advice-like narrative showing HOW a law affects a case.
        """
        case_context = f"Case Type: {case.case_type}, Current Status: {case.status}, Evidence Count: {case.number_of_evidence}"
        
        # Get the humanized advice from NLP service
        tech_advice, citizen_advice = self.nlp.generate_summaries(law.full_text, context=case_context)
        
        # Build a warm, advisory opening
        narrative = f"{citizen_advice} "
        
        # Weave in the specific mechanism of impact
        if "BNS" in law.title or "Bharatiya Nyaya Sanhita" in law.title:
             narrative += f"For your {case.case_type or 'matter'}, this is significant because it replaces older IPC definitions with modern standards. "
        elif "BNSS" in law.title or "Nagarik Suraksha" in law.title:
             narrative += "This is especially important because it sets new deadlines that should help your case move toward a hearing faster. "
        
        # Conclude with evidence-based context
        if case.number_of_evidence > 0:
            narrative += f"Your {case.number_of_evidence} pieces of evidence will now be viewed through this new lens to ensure your case is fully compliant with today's laws."
        else:
            narrative += "Your case parameters match the criteria for this update, ensuring your legal strategy remains up to date."
            
        return narrative
