from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from mongoengine import connect
import os

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'nyaysetu-jwt-secret-2026'
    app.config['JWT_SECRET_KEY'] = 'nyaysetu-jwt-secret-2026'
    
    # MongoDB Connection
    connect(host='mongodb://localhost:27017/nyaysetu_db')
    
    # Extensions
    jwt.init_app(app)
    CORS(app)
    
    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.cases import cases_bp
    from app.routes.laws import laws_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cases_bp, url_prefix='/api/cases')
    app.register_blueprint(laws_bp, url_prefix='/api/laws')
    
    return app
