from django.contrib.auth.models import User
from .models import Profile

def create_user_account(name, email, password):

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name
    )

    Profile.objects.create(
        user=user,
        name=name
    )

    return user