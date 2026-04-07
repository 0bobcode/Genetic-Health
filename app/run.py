"""
Launches both the FastAPI backend and Vite frontend dev servers.
"""

import subprocess
import sys
import os
from pathlib import Path

APP_DIR = Path(__file__).parent
BACKEND_DIR = APP_DIR / "backend"
FRONTEND_DIR = APP_DIR / "frontend"


def main():
    npm = "npm.cmd" if sys.platform == "win32" else "npm"

    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
        cwd=str(BACKEND_DIR),
        env={**os.environ, "PYTHONIOENCODING": "utf-8"},
    )

    frontend = subprocess.Popen(
        [npm, "run", "dev"],
        cwd=str(FRONTEND_DIR),
    )

    print("\n  SequenceMe is running!")
    print("  Frontend: http://localhost:5173")
    print("  Backend:  http://127.0.0.1:8000")
    print("  Press Ctrl+C to stop.\n")

    try:
        backend.wait()
    except KeyboardInterrupt:
        backend.terminate()
        frontend.terminate()


if __name__ == "__main__":
    main()
