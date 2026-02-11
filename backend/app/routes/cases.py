from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models.case import Case
from datetime import datetime

cases_bp = Blueprint('cases', __name__)

@cases_bp.route('', methods=['GET'])
@jwt_required()
def get_cases():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    limit_val = request.args.get('limit', type=int)
    
    query = {}
    if status:
        query['status'] = status
        
    offset = (page - 1) * per_page
    
    if limit_val:
        # If limit is set (for Top 10), we sort by priority score
        cases = Case.objects(**query).order_by('-priority_score').limit(limit_val)
    else:
        cases = Case.objects(**query).order_by('-created_at').skip(offset).limit(per_page)
    
    result = []
    for c in cases:
        c_dict = c.to_dict()
        # Use embedded impact_reports for O(1) list performance
        reports = c_dict.get('impact_reports', [])
        c_dict['law_impacts'] = [
            {
                'title': r['title'],
                'summary': r['explanation'][:100] + '...', # Brief summary from explanation
                'impact': r['explanation']
            } for r in reports
        ]
        result.append(c_dict)
        
    return jsonify(result), 200

@cases_bp.route('', methods=['POST'])
@jwt_required()
def create_case():
    data = request.get_json()
    claims = get_jwt()
    
    if claims.get('role') == 'citizen':
        return jsonify({'message': 'Unauthorized'}), 403
        
    case = Case(
        case_number=data['case_number'],
        case_type=data['case_type'],
        title=data['title'],
        description=data.get('description'),
        filing_date=datetime.fromisoformat(data['filing_date']),
        urgency=data.get('urgency', 'Medium'),
        number_of_evidence=data.get('number_of_evidence', 0),
        hearing_count=data.get('hearing_count', 0)
    )
    case.save()
    
    # Trigger AI background task
    from app.tasks.ai_tasks import process_case_priority
    process_case_priority.delay(str(case.id))
    
    return jsonify(case.to_dict()), 201

@cases_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    total = Case.objects.count()
    critical = Case.objects(predicted_priority='High').count()
    pending = Case.objects(status='Pending').count()
    
    # Priority breakdown for doughnut chart
    high = Case.objects(predicted_priority='High').count()
    medium = Case.objects(predicted_priority='Medium').count()
    low = Case.objects(predicted_priority='Low').count()
    
    return jsonify({
        'total': total,
        'critical': critical,
        'pending': pending,
        'chart': [high, medium, low]
    }), 200
