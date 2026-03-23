from mongoengine import connect
import os
import sys
from dotenv import load_dotenv

# Add backend to sys.path to find 'app' module
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.models.user import User


load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')

if not MONGO_URI:
    print("Error: MONGO_URI not found in .env file.")
    exit(1)

print(f"Connecting to MongoDB Atlas...")
try:
    connect(host=MONGO_URI)
    print("Connected successfully.")
except Exception as e:
    print(f"Connection failed: {e}")
    exit(1)

# Find 'RAKHI' or 'rakhi'
user = User.objects(username__iexact='RAKHI').first()

if user:
    print(f"Found user: {user.username}")
    print("Resetting password to: rakhi123")
    user.set_password("rakhi123")
    user.save()
    print("Password reset successful!")
    print("\nLogin Credentials:")
    print(f"Username: {user.username}")
    print("Password: rakhi123")
else:
    print("User 'RAKHI' not found in the database.")

print("\n--- DONE ---")
