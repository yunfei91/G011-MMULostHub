from django.contrib.auth.models import User

def create_user_account(name,email,password):
    return User.objects.create_user(
        first_name=name,
        username=email,
        email=email,
        password=password
    )