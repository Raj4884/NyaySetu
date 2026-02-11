# NyaySetu – Proactive Legal Insights & Case Prioritization System

Integrated AI-driven judicial support platform.

## Architecture
- **Backend**: Flask REST API + MongoDB
- **AI/ML**: XGBoost (Prioritization) + BERT/Transformers (Law Impact)
- **Frontend**: React + Tailwind CSS
- **Workers**: Celery + Redis

## Quick Start
1. **Database**: Ensure MongoDB and Redis are running.
2. **Setup**:
   ```bash
   py -m pip install -r backend/requirements.txt
   cd frontend && npm install
   ```
3. **Seed Data**:
   ```bash
   py backend/seed_mongo.py
   ```
4. **Run All**:
   ```bash
   py start_all.py
   ```

## Roles
- **Judge**: Full priority management and law ingestion.
- **Lawyer**: Technical law impact analysis.
- **Citizen**: Simplified legal summaries.
