import sys
import os
import json
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import create_app
from flask_jwt_extended import create_access_token, decode_token

def test():
    app = create_app()
    client = app.test_client()
    
    with app.app_context():
        # Test Case for Citizen
        print("--- TESTING CITIZEN ROLE ---")
        token = create_access_token(identity='rakhi', additional_claims={'role': 'citizen'})
        headers = {'Authorization': f'Bearer {token}'}
        
        response = client.get('/api/cases/stats', headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.get_json()}")

        # Test Case for Judge
        print("\n--- TESTING JUDGE ROLE ---")
        token_judge = create_access_token(identity='judge_user', additional_claims={'role': 'judge'})
        headers_judge = {'Authorization': f'Bearer {token_judge}'}
        
        response_judge = client.get('/api/cases/stats', headers=headers_judge)
        print(f"Status Code: {response_judge.status_code}")
        print(f"Response: {response_judge.get_json()}")

if __name__ == "__main__":
    test()
