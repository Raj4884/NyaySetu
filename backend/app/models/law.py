from mongoengine import Document, StringField, ListField, DateTimeField, FloatField
from datetime import datetime

class Law(Document):
    meta = {'collection': 'laws'}
    
    title = StringField(required=True)
    description = StringField(required=True)
    full_text = StringField(required=True)
    
    # NLP Data
    embeddings = ListField(FloatField())
    lawyer_summary = StringField()
    citizen_summary = StringField()
    impact_reasoning = StringField() # Explainable AI impact analysis
    
    # Metadata
    category = StringField()
    effective_date = DateTimeField()
    scraped_source = StringField()
    affecting_cases = ListField(StringField()) # List of Case IDs
    
    created_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        from app.models.case import Case
        # Fetch the affecting cases including their impact_reports
        cases = Case.objects(id__in=self.affecting_cases).only('case_number', 'title', 'impact_reports') if self.affecting_cases else []
        
        affecting_list = []
        for c in cases:
            # Find the specific impact report that matches this law's title
            explanation = "Automated correlation detected based on case category and evidence density."
            if c.impact_reports:
                for report in c.impact_reports:
                    if report.precedent_title == self.title:
                        explanation = report.impact_explanation
                        break
            
            affecting_list.append({
                'id': str(c.id),
                'case_number': c.case_number,
                'title': c.title,
                'how_it_affects': explanation
            })
            
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'full_text': self.full_text,
            'lawyer_summary': self.lawyer_summary,
            'citizen_summary': self.citizen_summary,
            'impact_reasoning': self.impact_reasoning,
            'category': self.category,
            'effective_date': self.effective_date.isoformat() if self.effective_date else None,
            'scraped_source': self.scraped_source,
            'affecting_cases': affecting_list,
            'created_at': self.created_at.isoformat()
        }
