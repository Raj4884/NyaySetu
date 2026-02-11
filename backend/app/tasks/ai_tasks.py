from app.tasks.celery_init import celery_app
from app.models.case import Case
from app.services.ml_service import MLService
from app.services.nlp_service import NLPService

@celery_app.task
def process_case_priority(case_id):
    case = Case.objects(id=case_id).first()
    if not case:
        return {'status': 'error', 'message': 'Case not found'}
    
    ml_service = MLService()
    priority, score, rationale = ml_service.predict(case)
    
    case.predicted_priority = priority
    case.priority_score = score
    case.priority_reasoning = rationale
    case.status = 'Processed'
    case.save()
    
    return {'status': 'success', 'priority': priority}

@celery_app.task
def analyze_law_impact_on_cases(law_id):
    from app.models.law import Law
    from app.services.impact_service import ImpactService
    
    law = Law.objects(id=law_id).first()
    if not law:
        return {'status': 'error', 'message': 'Law not found'}
        
    impactor = ImpactService()
    impact_count = impactor.analyze_and_apply_impact(law)
    
    return {'status': 'success', 'impacts_established': impact_count}

@celery_app.task
def sync_latest_laws_periodic():
    """
    Scheduled task to fetch and apply law changes.
    """
    from app.services.scraper_service import ScraperService
    from app.services.impact_service import ImpactService
    
    scraper = ScraperService()
    impactor = ImpactService()
    
    new_laws = scraper.fetch_recent_enactments()
    total_impacts = 0
    for law in new_laws:
        total_impacts += impactor.analyze_and_apply_impact(law)
        
    return {'laws_synced': len(new_laws), 'total_impacts': total_impacts}
