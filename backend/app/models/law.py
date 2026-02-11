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
            'affecting_cases': self.affecting_cases,
            'created_at': self.created_at.isoformat()
        }
