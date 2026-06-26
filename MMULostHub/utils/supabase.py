from supabase import create_client
import uuid

SUPABASE_URL = "https://pdbydobgtrgtxqjtvcbb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkYnlkb2JndHJndHhxanR2Y2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTc2NTcsImV4cCI6MjA5ODA3MzY1N30.BQ_ZDCHpX4-gDLjzUiZ9tBHtIbiUexIJVNauCuEWjiQ"
BUCKET = "media"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_to_supabase(file):
    file_ext = file.name.split('.')[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"

    supabase.storage.from_(BUCKET).upload(
        file_name,
        file.read()
    )

    return supabase.storage.from_(BUCKET).get_public_url(file_name)