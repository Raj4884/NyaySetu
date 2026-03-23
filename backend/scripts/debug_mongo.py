import pymongo
import os
import sys
from dotenv import load_dotenv
import ssl

# Add backend to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')

print(f"Testing raw pymongo connection to: {MONGO_URI.split('@')[-1]}")

try:
    # Try with standard settings first
    client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    print("Attempt 1: Standard connection...")
    client.admin.command('ping')
    print("✅ Attempt 1 Success!")
except Exception as e:
    print(f"❌ Attempt 1 Failed: {e}")

    try:
        # Try with ignored SSL certificates and explicit TLS
        print("\nAttempt 2: Connection with tlsAllowInvalidCertificates=True...")
        client = pymongo.MongoClient(
            MONGO_URI, 
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000
        )
        client.admin.command('ping')
        print("✅ Attempt 2 Success!")
    except Exception as e2:
        print(f"❌ Attempt 2 Failed: {e2}")

        try:
            # Try forcing TLS 1.2 or higher if possible
            print("\nAttempt 3: Forcing SSL context...")
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            
            client = pymongo.MongoClient(
                MONGO_URI,
                tls=True,
                tlsContext=context,
                serverSelectionTimeoutMS=5000
            )
            client.admin.command('ping')
            print("✅ Attempt 3 Success!")
        except Exception as e3:
            print(f"❌ Attempt 3 Failed: {e3}")
            print("\nAll attempts failed. This is likely a network/firewall issue or Python SSL library incompatibility.")

print("\n--- DEBUG DONE ---")
