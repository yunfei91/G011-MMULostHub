from django.contrib.auth.models import User
from .models import Profile

def create_user_account(username, email, password):
    if User.objects.filter(username=username).exists():
        username = username + email.split("@")[0]
        
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    return user