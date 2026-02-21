from mongoengine import Document, StringField, DateTimeField, ReferenceField, BooleanField
from datetime import datetime

class Notification(Document):
    meta = {
        'collection': 'notifications',
        'indexes': ['user', '-created_at']
    }
    
    user = ReferenceField('User', required=True)
    title = StringField(required=True)
    message = StringField(required=True)
    type = StringField(choices=['LawImpact', 'System', 'CaseUpdate'], default='LawImpact')
    read = BooleanField(default=False)
    link_to_id = StringField() # Law ID or Case ID
    created_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'read': self.read,
            'link_to_id': self.link_to_id,
            'created_at': self.created_at.isoformat()
        }
