from django.contrib.auth.models import User
from .models import Profile

def create_user_account(name, email, password):

    username = email
    if User.objects.filter(username=username).exists():
        return None
        
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=name
    )

    Profile.objects.get_or_create(user=user)

    profile = user.profile
    profile.name = name
    profile.save()
    
    return user