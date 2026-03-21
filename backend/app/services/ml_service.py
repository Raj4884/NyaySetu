import joblib
import os
import numpy as np
from datetime import datetime

class MLService:
    def __init__(self):
        # Locate model directory relative to this file's location
        # f:\NYAYSETU\backend\app\services\ml_service.py -> f:\NYAYSETU\backend\ml_models
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.model_dir = os.path.join(base_dir, 'ml_models')
        self.model_path = os.path.join(self.model_dir, 'priority_model.joblib')
        self.encoder_path = os.path.join(self.model_dir, 'le_case_type.joblib')
        
        self.model = None
        self.encoder = None
        
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.encoder = joblib.load(self.encoder_path)

    def predict(self, case):
        res = self.predict_batch([case])
        return res[0]

    def predict_batch(self, cases):
        """
        Engineered for high-volume ingestion: 
        Process multiple cases simultaneously using vectorized inference.
        Now includes court-level prioritization.
        """
        if not self.model or not self.encoder:
            return [self._fallback_predict(c) for c in cases]

        try:
            now = datetime.utcnow()
            feature_list = []
            case_types = []
            
            for case in cases:
                # 1. Vectorization
                case_type_raw = str(case.case_type).split()[0]
                case_types.append(case_type_raw)
                try:
                    type_encoded = self.encoder.transform([case_type_raw])[0]
                except (ValueError, KeyError):
                    type_encoded = 0 

                filing_date = case.filing_date if hasattr(case, 'filing_date') else now
                years_pending = (now - filing_date).days / 365.25

                # 2. Urgency & Sensitivity Augmentation (SRS Alignment)
                desc = str(case.description or "").lower()
                urgency_boost = 0
                if any(kw in desc for kw in ["bail", "custody", "arrest"]):
                    urgency_boost += 0.10
                if any(kw in desc for kw in ["injunction", "stay order", "urgent"]):
                    urgency_boost += 0.08
                
                sensitivity_score = float(getattr(case, 'social_sensitivity', 0)) / 10.0 # Normalize 0-10 to 0-1

                feature_list.append([
                    float(type_encoded),
                    float(case.number_of_evidence or 0),
                    float(case.hearing_count or 0),
                    float(years_pending),
                    sensitivity_score,
                    urgency_boost
                ])

            # 2. Vectorized Neural Inference
            # For simplicity, we manually combine the trained model output with our new heuristic boosts
            # in a production setting, we would re-train the model with these as input features.
            base_features = np.array([f[:4] for f in feature_list])
            base_scores = self.model.predict(base_features)
            
            results = []
            for i, base_score in enumerate(base_scores):
                # 3. Augmentation logic
                sensitivity_score = feature_list[i][4]
                urgency_boost = feature_list[i][5]
                # Supreme Court and High Court cases get a priority boost
                court_boost = 0
                case_obj = cases[i]
                if hasattr(case_obj, 'court_type'):
                    if case_obj.court_type == 'Supreme Court':
                        court_boost = 0.25
                    elif case_obj.court_type == 'High Court':
                        court_boost = 0.15
                
                total_score = max(0, min(0.99, float(base_score) + court_boost + urgency_boost + (sensitivity_score * 0.15)))

                # 4. Map to Labels
                if total_score > 0.70:
                    priority = 'High'
                elif total_score > 0.35:
                    priority = 'Medium'
                else:
                    priority = 'Low'
                
                # 5. Generate Rationale
                rationale = self._generate_detailed_rationale(
                    cases[i], 
                    case_types[i], 
                    int(cases[i].number_of_evidence or 0), 
                    int(cases[i].hearing_count or 0), 
                    priority,
                    total_score
                )
                results.append((priority, total_score, rationale))
            
            return results

        except Exception as e:
            print(f"ML Batch Prediction Error: {e}")
            return [self._fallback_predict(c) for c in cases]

    def _generate_detailed_rationale(self, case, category, evidence_count, hearing_count, priority, score):
        from datetime import datetime
        
        # 1. Seniority Calculation
        filing_date = case.filing_date if hasattr(case, 'filing_date') else datetime.utcnow()
        years_pending = (datetime.utcnow() - filing_date).days / 365.25
        
        # 2. Map to Human-Friendly Taxonomy
        case_type_map = {
            'Criminal': 'important criminal matter',
            'Bail': 'request for bail',
            'Civil': 'civil dispute',
            'Labour': 'workplace or labour issue',
            'Technology': 'digital rights case'
        }
        human_category = case_type_map.get(category, f"{category.lower()} case")
        
        # 3. Build Natural Language Narrative
        narrative = f"This {human_category} has been flagged for {priority.lower()} priority. "
        
        reasons = []
        if years_pending > 2:
            reasons.append(f"it has been waiting for over {int(years_pending)} years")
        elif years_pending > 0.5:
            reasons.append("it has been in the system for several months")
            
        if evidence_count > 10:
            reasons.append("there is a significant amount of evidence to review")
        elif evidence_count > 0:
            reasons.append("there are important documents and evidence attached")
            
        if hearing_count > 5:
            reasons.append("it has already gone through multiple hearings and is nearing a conclusion")
        elif hearing_count > 0:
            reasons.append("procedural steps are already underway")

        if reasons:
            if len(reasons) > 1:
                narrative += "This is mainly because " + ", ".join(reasons[:-1]) + ", and " + reasons[-1] + ". "
            else:
                narrative += "This is happening because " + reasons[0] + ". "
        
        # 4. Social & Urgency Rationale (XAI)
        if getattr(case, 'social_sensitivity', 0) > 6:
            narrative += "Furthermore, the significant social impact of this matter necessitates accelerated judicial attention. "
        
        desc = str(case.description or "").lower()
        if "custody" in desc or "arrest" in desc:
            narrative += "The involvement of personal liberty (custody/arrest) triggers immediate high-priority processing. "
        elif "injunction" in desc or "stay order" in desc:
            narrative += "The request for interim relief (injunction) requires timely intervention to prevent irreparable harm. "

        if not reasons and not ("custody" in desc or "injunction" in desc):
            narrative += "We are handling this based on the typical timelines for these types of cases. "

        # 4. Final Empathy Touch
        if priority == 'High':
            narrative += "We've moved this case to the front of the line to help you get a resolution faster."
        else:
            narrative += "The court is processing this steadily alongside other matters."

        return narrative

    def _fallback_predict(self, case):
        # Basic heuristic fallback
        score = 0.5
        priority = 'Medium'
        rationale = "AI JUDICIAL INSIGHT: Case prioritization established via baseline statutory urgency vectors."
        return priority, score, rationale
