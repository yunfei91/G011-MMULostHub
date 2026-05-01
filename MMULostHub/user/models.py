from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    name = models.CharField(max_length=100, blank=True, unique=True)
    bio = models.CharField(max_length=255, blank=True, null=True, default="")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    mmu_email = models.EmailField(blank=True, null=True)
    mmu_proof = models.ImageField(upload_to='mmu_proof/', blank=True, null=True)

    is_mmu_verified = models.BooleanField(default=False)
    submitted_for_verification = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name if self.name else self.user.username
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['mmu_email'], name='unique_mmu_email')
        ]