from supabase import create_client
import os
import uuid

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET = "media"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def upload_to_supabase(file, folder="uploads"):
    ext = file.name.split('.')[-1]
    filename = f"{folder}/{uuid.uuid4()}.{ext}"

    supabase.storage.from_(BUCKET).upload(
        filename,
        file.read(),
        {"content-type": file.content_type}
    )

    return supabase.storage.from_(BUCKET).get_public_url(filename)