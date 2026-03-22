from app import create_app
import os

# Create required directories at top level for Gunicorn
os.makedirs('ml_models', exist_ok=True)
os.makedirs('data/storage', exist_ok=True)

app = create_app()

@app.route('/')
def health_check():
    return {"status": "NyaySetu Backend Operational"}, 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
