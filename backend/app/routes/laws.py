from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.models.law import Law
from app.models.user import User
from app.services.nlp_service import NLPService
from app.services.email_service import EmailService
from app.tasks.ai_tasks import analyze_law_impact_on_cases

laws_bp = Blueprint('laws', __name__)

@laws_bp.route('', methods=['GET'])
@jwt_required()
def get_laws():
    laws = Law.objects().order_by('-created_at')
    return jsonify([l.to_dict() for l in laws]), 200

@laws_bp.route('/<law_id>/email', methods=['POST'])
@jwt_required()
def email_law_report(law_id):
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    law = Law.objects(id=law_id).first()
    
    if not user or not law:
        return jsonify({'message': 'Data not found'}), 404
        
    email_svc = EmailService()
    email_svc.send_law_impact_email(
        user_email=user.email,
        user_name=user.full_name or user.username,
        law_title=law.title,
        impact_rationale=law.impact_reasoning or law.lawyer_summary
    )
    
    return jsonify({'message': 'Report dispatched to your email'}), 200

@laws_bp.route('', methods=['POST'])
@jwt_required()
def create_law():
    data = request.get_json()
    claims = get_jwt()
    
    if claims.get('role') != 'judge':
        return jsonify({'message': 'Unauthorized'}), 403
        
    nlp = NLPService()
    l_sum, c_sum = nlp.generate_summaries(data['full_text'])
    
    law = Law(
        title=data['title'],
        description=data.get('description'),
        full_text=data['full_text'],
        lawyer_summary=l_sum,
        citizen_summary=c_sum,
        category=data.get('category')
    )
    law.save()
    
    # Trigger semantic matching background task
    analyze_law_impact_on_cases.delay(str(law.id))
    
    return jsonify(law.to_dict()), 201
