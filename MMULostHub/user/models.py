from django.db import models # Import Django model classes
from django.contrib.auth.models import User # Import Django built-in User model

# Store additional user profile information
class Profile(models.Model):
    # One-to-one relationship with Django User
    user = models.OneToOneField(User, on_delete=models.CASCADE) 
    name = models.CharField(max_length=100, blank=True)
    avatar = models.URLField(blank=True, null=True)
    bio = models.CharField(max_length=255, blank=True, null=True, default="")
    
    #zinc add 
    is_reported = models.BooleanField(default=False) 
    need_reverify = models.BooleanField(default=False)
    is_reverified = models.BooleanField(default=True)
    
    # Display profile name if available, otherwise display username=email
    def __str__(self):
        return self.name if self.name else self.user.username
