import sys
import os

# Mocking app to test services in isolation if needed, but since we have the full structure, let's try to load them.
# Adding current directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.nlp_service import NLPService
from app.services.impact_service import ImpactService
from unittest.mock import MagicMock

def test_legal_section_extraction():
    nlp = NLPService()
    text = "This law amends Section 41A and Section 376 of the CrPC. Also Article 21 is relevant."
    sections = nlp.extract_legal_sections(text)
    print(f"Extracted Sections: {sections}")
    assert "Section 41A" in sections
    assert "Section 376" in sections
    assert "Article 21" in sections
    print("✅ Legal Section Extraction Test Passed!")

def test_impact_scoring_logic():
    impact_svc = ImpactService()
    
    # Mock Law and Case
    law = MagicMock()
    law.title = "New Bail Amendment 2024"
    
    case = MagicMock()
    case.case_type = "Criminal"
    case.stage = "Appeal"
    case.social_sensitivity = 8
    
    # Scenario 1: Section Match + High Similarity + Appeal + Criminal + Sensitivity
    law_sections = ["Section 41A"]
    case_sections = ["Section 41A"]
    similarity = 0.8
    
    score, reasons = impact_svc.calculate_impact_score(law, case, similarity, law_sections, case_sections)
    print(f"Scenario 1 Score: {score}, Reasons: {reasons}")
    # Expected: 40 (section) + 24 (0.8*30) + 15 (Appeal) + 10 (Criminal) + 5 (Sensitivity) = 94
    assert score == 94
    
    # Scenario 2: No Section Match, Lower Similarity, Trial stage
    case.stage = "Trial"
    case.social_sensitivity = 2
    case_sections = ["Section 100"]
    similarity = 0.5
    
    score, reasons = impact_svc.calculate_impact_score(law, case, similarity, law_sections, case_sections)
    print(f"Scenario 2 Score: {score}, Reasons: {reasons}")
    # Expected: 0 (section) + 15 (0.5*30) + 10 (Trial) + 10 (Criminal) + 0 (Sensitivity) = 35
    assert score == 35
    
    print("✅ Impact Scoring Logic Test Passed!")

if __name__ == "__main__":
    try:
        test_legal_section_extraction()
        test_impact_scoring_logic()
        print("\n🚀 ALL TESTS PASSED SUCCESSFULLY!")
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        sys.exit(1)
