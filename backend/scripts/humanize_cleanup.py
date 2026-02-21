import os
import sys
from mongoengine import connect

# Standardize path
PROJECT_ROOT = "f:/NYAYSETU"
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
sys.path.insert(0, BACKEND_DIR)

from app.models.user import User
from app.models.case import Case
from app.models.law import Law

def cleanup_legacy_rationales():
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    
    print("🧹 Starting Targeted Humanization Cleanup...")
    
    # 1. Cleanup Case Priority Reasoning (Only those with legacy markers)
    cases_priority = Case.objects(priority_reasoning__icontains="AI")
    print(f"🔍 Found {cases_priority.count()} cases with legacy priority reasoning.")
    for case in cases_priority:
        reason = case.priority_reasoning
        # Remove common prefixes
        prefixes = ["AI ASSISTANCE NOTE:", "AI JUDICIAL INSIGHT:", "AUTOMATED PRIORITY:"]
        for p in prefixes:
            reason = reason.replace(p, "").strip()
        
        if "JUDICIAL CONCLUSION:" in reason:
            reason = reason.split("JUDICIAL CONCLUSION:")[0].strip()
            
        case.update(set__priority_reasoning=reason)
    
    # 2. Cleanup Case Impact Reports (Only those with legacy markers)
    cases_impact = Case.objects(impact_reports__impact_explanation__icontains="EXPLAINABLE")
    print(f"🔍 Found {cases_impact.count()} cases with legacy impact reports.")
    for case in cases_impact:
        updated_reports = []
        for report in case.impact_reports:
            explanation = report.impact_explanation
            if "EXPLAINABLE" in explanation or "EXTRACT KEY" in explanation:
                # Strip clinical labels
                explanation = explanation.replace("EXPLAINABLE AI [TECHNICAL]:", "")
                explanation = explanation.replace("EXPLAINABLE AI [SIMPLE]:", "")
                explanation = explanation.replace("EXTRACT KEY LEGAL SECTIONS:", "")
                explanation = explanation.replace("Why it affects you:", "")
                
                # Cleanup garbled punctuation often seen in old T5 outputs
                explanation = explanation.replace(", and . () () - ; / ..", ".")
                explanation = explanation.replace("EXTRACT KEY LEGAL SECTIONS:", "")
                explanation = explanation.strip()
                
                # Deduplicate sentences
                sentences = explanation.split(".")
                unique_sentences = []
                for s in sentences:
                    s_strip = s.strip()
                    if s_strip and s_strip not in unique_sentences:
                        unique_sentences.append(s_strip)
                explanation = ". ".join(unique_sentences)
                if not explanation.endswith("."): explanation += "."
                
                report.impact_explanation = explanation
            updated_reports.append(report)
        
        case.update(set__impact_reports=updated_reports)

    # 3. Cleanup Law Summaries
    laws = Law.objects()
    print(f"🔍 Found {laws.count()} laws to humanize.")
    for law in laws:
        l_sum = law.lawyer_summary
        c_sum = law.citizen_summary
        
        l_sum = l_sum.replace("EXPLAINABLE AI [TECHNICAL]:", "").strip()
        c_sum = c_sum.replace("EXPLAINABLE AI [SIMPLE]:", "").strip()
        
        law.update(set__lawyer_summary=l_sum, set__citizen_summary=c_sum)

    print("✅ Targeted Cleanup Complete.")

if __name__ == "__main__":
    cleanup_legacy_rationales()
