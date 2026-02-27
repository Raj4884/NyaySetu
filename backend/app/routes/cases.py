from flask import Blueprint, request, jsonify
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt
from app.models.case import Case
from app.models.law import Law
# Move MLService import inside getter to avoid module-level DLL loading
_ml_svc = None

def get_ml_svc():
    global _ml_svc
    if _ml_svc is None:
        from app.services.ml_service import MLService
        _ml_svc = MLService()
    return _ml_svc

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
        # Just-in-Time (JIT) Reasoning Generation
        # If case hasn't been processed by background worker, process it now for the user view
        placeholder = "Semantic analysis in progress..."
        if not c.priority_reasoning or c.priority_reasoning == placeholder:
            priority, score, rationale = get_ml_svc().predict(c)
            c.update(
                set__predicted_priority=priority,
                set__priority_score=score,
                set__priority_reasoning=rationale,
                set__status='Processed'
            )
            c.reload()

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
        court_type=data.get('court_type', 'District Court'),
        court_name=data.get('court_name'),
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
    from datetime import datetime, timedelta
    claims = get_jwt()
    role = claims.get('role', 'citizen')
    
    total_cases = Case.objects.count()
    total_laws = Law.objects.count()
    
    # Calculate pending metrics for all roles
    total_pending = Case.objects(status='Pending').count()
    pending_cases = Case.objects(status='Pending')
    
    # Calculate average pendency (days in pending status)
    if total_pending > 0:
        today = datetime.utcnow()
        total_days = 0
        for case in pending_cases:
            days_pending = (today - case.filing_date).days
            total_days += days_pending
        avg_pendency = total_days // total_pending
    else:
        avg_pendency = 0
    
    court_dist = {
        'Supreme Court': Case.objects(court_type='Supreme Court').count(),
        'High Court': Case.objects(court_type='High Court').count(),
        'District Court': Case.objects(court_type='District Court').count(),
        'Session Court': Case.objects(court_type='Session Court').count()
    }
    
    if role == 'judge':
        critical = Case.objects(predicted_priority='High').count()
        high = Case.objects(predicted_priority='High').count()
        medium = Case.objects(predicted_priority='Medium').count()
        low = Case.objects(predicted_priority='Low').count()
        
        return jsonify({
            'total': total_cases,
            'critical': critical,
            'pending': total_pending,
            'avg_pendency': avg_pendency,
            'chart': [high, medium, low],
            'court_distribution': court_dist
        }), 200
        
    elif role == 'lawyer':
        # Lawyers care about impacted cases and active laws
        impacted = Case.objects(law_impacts__not__size=0).count()
        high_alerts = Case.objects(predicted_priority='High', law_impacts__not__size=0).count()
        
        return jsonify({
            'total': total_cases,
            'critical': high_alerts,
            'pending': total_pending,
            'avg_pendency': avg_pendency,
            'chart': [high_alerts, impacted - high_alerts, total_cases - impacted],
            'court_distribution': court_dist
        }), 200
        
    else: # citizen
        # Citizens care about rights and transparency
        # Simulated transparency: % of cases with AI rationales
        processed = Case.objects(status='Processed').count()
        transparency = int((processed / total_cases * 100)) if total_cases > 0 else 100
        
        return jsonify({
            'total': total_laws, # Laws affecting rights
            'critical': transparency, # Transparency score %
            'pending': total_pending,
            'avg_pendency': avg_pendency,
            'chart': [total_laws, total_cases // 100, processed // 1000], # Representative bits
            'court_distribution': court_dist
        }), 200
