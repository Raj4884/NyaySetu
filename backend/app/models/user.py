from mongoengine import Document, StringField, EmailField, BooleanField, DateTimeField
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(Document):
    meta = {'collection': 'users'}
    
    username = StringField(required=True, unique=True, max_length=50)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    role = StringField(required=True, choices=['judge', 'lawyer', 'citizen'], default='citizen')
    full_name = StringField(max_length=120)
    phone = StringField(max_length=20)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat()
        }
