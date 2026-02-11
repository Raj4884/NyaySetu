from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models.law import Law
from app.services.nlp_service import NLPService
from app.tasks.ai_tasks import analyze_law_impact_on_cases

laws_bp = Blueprint('laws', __name__)

@laws_bp.route('', methods=['GET'])
@jwt_required()
def get_laws():
    laws = Law.objects().order_by('-created_at')
    return jsonify([l.to_dict() for l in laws]), 200

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
