"""
Vercel Serverless Entry Point
"""
import os
from pathlib import Path

# Load .env file if it exists
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip())

from app import create_app

app = create_app()

# Vercel expects 'app' to be the WSGI application
