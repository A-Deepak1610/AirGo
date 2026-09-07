"""
AirGo Configuration.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

SUPABASE_DB_URI = os.getenv(
    "SUPABASE_DB_URI",
    os.getenv("DATABASE_URL", "postgresql://postgres:Teamssg%402026@db.hhmcoffljphnzfrlkewe.supabase.co:5432/postgres")
)
DATABASE_URL = SUPABASE_DB_URI

API_HOST = os.getenv("API_HOST", "127.0.0.1")
API_PORT = int(os.getenv("API_PORT", "8000"))
