from mongoengine import Document, StringField, ListField, DateTimeField, FloatField, IntField
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
    sections = ListField(StringField()) # Extracted sections like "Section 41A"
    
    # Metadata
    category = StringField()
    effective_date = DateTimeField()
    scraped_source = StringField()
    affecting_cases = ListField(StringField()) # List of Case IDs
    affected_count = IntField(default=0)
    
    created_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self, include_details=False):
        from app.models.case import Case
        
        affecting_list = []
        if include_details and self.affecting_cases:
            # Fetch the affecting cases including their impact_reports
            cases = Case.objects(id__in=self.affecting_cases).only('case_number', 'title', 'impact_reports')
            
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
            'sections': self.sections,
            'effective_date': self.effective_date.isoformat() if self.effective_date else None,
            'scraped_source': self.scraped_source,
            'affecting_cases': affecting_list,
            'affected_count': self.affected_count or len(self.affecting_cases or []),
            'created_at': self.created_at.isoformat()
        }
