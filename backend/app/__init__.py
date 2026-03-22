from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from mongoengine import connect
from dotenv import load_dotenv
import os
import sys

def flush_print(msg):
    print(msg)
    sys.stdout.flush()

load_dotenv()

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'nyaysetu-jwt-secret-2026'
    app.config['JWT_SECRET_KEY'] = 'nyaysetu-jwt-secret-2026'
    
    # MongoDB Connection
    flush_print("Connecting to MongoDB...")
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/nyaysetu_db')
    try:
        connect(host=mongo_uri, serverSelectionTimeoutMS=5000)
        flush_print("Connected to MongoDB successfully.")
    except Exception as e:
        flush_print(f"Error connecting to MongoDB: {e}")
    
    # Extensions
    jwt.init_app(app)
    CORS(app)
    flush_print("Flask app initialized with extensions.")
    
    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.cases import cases_bp
    from app.routes.laws import laws_bp
    from app.routes.notifications import notifications_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cases_bp, url_prefix='/api/cases')
    app.register_blueprint(laws_bp, url_prefix='/api/laws')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    return app
