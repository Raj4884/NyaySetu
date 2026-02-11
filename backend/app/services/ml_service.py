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

                feature_list.append([
                    float(type_encoded),
                    float(case.number_of_evidence or 0),
                    float(case.hearing_count or 0),
                    float(years_pending)
                ])

            # 2. Vectorized Neural Inference
            features_array = np.array(feature_list)
            scores = self.model.predict(features_array)
            
            results = []
            for i, score in enumerate(scores):
                total_score = max(0, min(0.99, float(score)))

                # 3. Map to Labels
                if total_score > 0.70:
                    priority = 'High'
                elif total_score > 0.35:
                    priority = 'Medium'
                else:
                    priority = 'Low'
                
                # 4. Generate Rationale
                rationale = self._generate_detailed_rationale(
                    cases[i], 
                    case_types[i], 
                    int(cases[i].number_of_evidence or 0), 
                    int(cases[i].hearing_count or 0), 
                    priority
                )
                results.append((priority, total_score, rationale))
            
            return results

        except Exception as e:
            print(f"ML Batch Prediction Error: {e}")
            return [self._fallback_predict(c) for c in cases]

    def _generate_detailed_rationale(self, case, category, evidence_count, hearing_count, priority):
        from datetime import datetime
        reasons = []
        
        # 1. Seniority Calculation
        filing_date = case.filing_date if hasattr(case, 'filing_date') else datetime.utcnow()
        years_pending = (datetime.utcnow() - filing_date).days / 365.25
        
        # 2. Case Type Branding
        type_desc = f"{category} matter"
        if category in ['Criminal', 'BAILC', 'SESS']:
            type_desc = f"Critical {category} case"
            reasons.append(f"high statutory weight of {category} proceedings")
        
        # 3. Activity Density
        if evidence_count > 15:
            reasons.append(f"maximum evidence density ({evidence_count} items filed)")
        elif evidence_count > 5:
            reasons.append(f"significant evidentiary record ({evidence_count} items)")
        
        if hearing_count > 8:
            reasons.append(f"persistent procedural history ({hearing_count} hearings)")
        elif hearing_count > 3:
            reasons.append(f"active hearing schedule ({hearing_count} hearings)")

        # 4. Seniority Narrative
        seniority_text = ""
        if years_pending > 2:
            seniority_text = f"waited for over {years_pending:.1f} years"
            reasons.append(f"prolonged judicial pendency ({years_pending:.1f} years)")
        elif years_pending > 1:
            seniority_text = f"waited for {years_pending:.1f} years"
        
        # 5. Final Narrative Assembly
        is_fresh = (evidence_count == 0 and hearing_count == 0)
        insight = f"AI JUDICIAL INSIGHT: This {type_desc} "
        if seniority_text:
            insight += f"has {seniority_text} and "
        
        if is_fresh:
            reasons.append("initial procedural stages")
            insight += "is prioritized primarily by statutory status despite minimal recent activity."
        else:
            insight += f"requires immediate attention due to: " + ", ".join(reasons) + "."
            
        return insight

    def _fallback_predict(self, case):
        # Basic heuristic fallback
        score = 0.5
        priority = 'Medium'
        rationale = "AI JUDICIAL INSIGHT: Standard procedural baseline (Model Loading...)"
        return priority, score, rationale
