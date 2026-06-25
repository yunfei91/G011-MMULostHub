from django.contrib.auth.models import User
from .models import Profile # Import custom Profile model for extended user information

# Create a new user account with profile information
def create_user_account(name, email, password):

    # Create Django user with email as username and hashed password
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name
    )

    # Create a related Profile object for the new user
    Profile.objects.create(
        user=user,
        name=name
    )

    return user