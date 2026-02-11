import subprocess
import os
import sys
import time

def run_services():
    print("🚀 Initializing NyaySetu Services...")
    
    # Create logs directory
    os.makedirs('logs', exist_ok=True)
    
    backend_log = open('logs/backend.log', 'w')
    celery_log = open('logs/celery.log', 'w')
    frontend_log = open('logs/frontend.log', 'w')

    print("👉 Starting Backend API...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run.py"], 
        cwd="backend",
        stdout=backend_log,
        stderr=subprocess.STDOUT,
        text=True
    )
    
    print("👉 Starting Celery Worker (Requires Redis)...")
    celery_proc = subprocess.Popen(
        [sys.executable, "-m", "celery", "-A", "app.tasks.celery_init", "worker", "--loglevel=info"],
        cwd="backend",
        stdout=celery_log,
        stderr=subprocess.STDOUT,
        text=True
    )

    print("👉 Starting Frontend Dev Server...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="frontend",
        shell=True,
        stdout=frontend_log,
        stderr=subprocess.STDOUT,
        text=True
    )

    print("\n✅ Services launched in background.")
    print("🔗 API: http://localhost:5000")
    print("🔗 Web UI: http://localhost:3000")
    print("📝 View logs in /logs folder if connection fails.")
    print("\nKeep this terminal open. Press Ctrl+C to stop.")

    try:
        while True:
            time.sleep(1)
            # Check if processes are alive
            if backend_proc.poll() is not None:
                print("⚠️ Backend crashed! Check /logs/backend.log")
                break
            if frontend_proc.poll() is not None:
                print("⚠️ Frontend crashed! Check /logs/frontend.log")
                break
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
    finally:
        backend_proc.terminate()
        celery_proc.terminate()
        frontend_proc.terminate()
        backend_log.close()
        celery_log.close()
        frontend_log.close()

if __name__ == "__main__":
    run_services()
