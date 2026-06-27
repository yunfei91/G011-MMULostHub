from supabase import create_client
import os
import uuid
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

load_dotenv(BASE_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET = "media"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing Supabase env variables")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_to_supabase(file, folder="uploads"):
    ext = file.name.split('.')[-1]

    filename = f"{folder}/{uuid.uuid4()}.{ext}"

    supabase.storage.from_(BUCKET).upload(
        path=filename,
        file=file.read(),
        file_options={
            "content-type": file.content_type
        }
    )

    return supabase.storage.from_(BUCKET).get_public_url(filename)["publicUrl"]