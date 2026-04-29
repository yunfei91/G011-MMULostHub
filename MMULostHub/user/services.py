from django.contrib.auth.models import User
from .models import Profile

def create_user_account(name, email, password):

    user, created = User.objects.get_or_create(
        username=email,
        defaults={
            "email": email,
            "first_name": name
        }
    )

    if created:
        user.set_password(password)
        user.save()

    profile, _ = Profile.objects.get_or_create(user=user)
    profile.name = name
    profile.save()
    
    return user