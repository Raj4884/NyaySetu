from mongoengine import Document, StringField, FloatField, DateTimeField, ReferenceField, IntField, ListField, EmbeddedDocument, EmbeddedDocumentField
from datetime import datetime

class LawImpact(EmbeddedDocument):
    precedent_title = StringField()
    precedent_citation = StringField()
    source = StringField()
    relevance_score = FloatField()
    url = StringField()
    impact_explanation = StringField()

class Case(Document):
    meta = {
        'collection': 'cases',
        'indexes': [
            'case_type',
            '-created_at',
            'predicted_priority',
            'status'
        ]
    }
    
    case_number = StringField(required=True, unique=False)
    case_type = StringField(required=True)
    title = StringField(required=True)
    description = StringField()
    filing_date = DateTimeField(required=True)
    status = StringField(default='Pending')
    
    # Metadata for AI
    urgency = StringField(choices=['High', 'Medium', 'Low'], default='Medium')
    number_of_evidence = IntField(default=0)
    hearing_count = IntField(default=0)
    
    # AI Results
    priority_score = FloatField()
    predicted_priority = StringField() # High, Medium, Low
    priority_reasoning = StringField() # Explainable AI reasoning
    
    # Impact Analysis
    impact_reports = ListField(EmbeddedDocumentField(LawImpact))
    
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'case_number': self.case_number,
            'case_type': self.case_type,
            'title': self.title,
            'description': self.description,
            'filing_date': self.filing_date.isoformat(),
            'status': self.status,
            'urgency': self.urgency,
            'priority_score': self.priority_score,
            'predicted_priority': self.predicted_priority,
            'priority_reasoning': self.priority_reasoning,
            'number_of_evidence': self.number_of_evidence,
            'hearing_count': self.hearing_count,
            'impact_reports': [
            {
                'title': ir.precedent_title,
                'source': ir.source,
                'relevance_score': ir.relevance_score,
                'url': ir.url,
                'explanation': ir.impact_explanation
            } for ir in self.impact_reports
        ] if self.impact_reports else []
        }
