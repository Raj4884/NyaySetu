from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ['username', 'email', 'password', 'role']):
        return jsonify({'message': 'Missing fields'}), 400
    
    if User.objects(username=data['username']).first() or User.objects(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        role=data['role'],
        full_name=data.get('full_name')
    )
    user.set_password(data['password'])
    user.save()
    
    return jsonify(user.to_dict()), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.objects(username=data.get('username')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200
