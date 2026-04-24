from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    comments = models.TextField()
    image = models.ImageField(upload_to='feedback_images/', null=True, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=[('Pending', 'Pending'), ('Resolved', 'Resolved')],
        default='Pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback {self.id} - {self.created_at}"