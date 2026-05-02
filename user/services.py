from django.contrib.auth.models import User
from .models import Profile

def create_user_account(name, email, password):
    user = User.objects.create_user(
        first_name=name,
        username=email,
        email=email,
        password=password
    )
    return user