from app import create_app
import os

app = create_app()

@app.route('/')
def health_check():
    return {"status": "NyaySetu Backend Operational"}, 200

if __name__ == "__main__":
    # Create required directories
    os.makedirs('backend/ml_models', exist_ok=True)
    os.makedirs('backend/data/storage', exist_ok=True)
    
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
