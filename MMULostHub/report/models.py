from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='feedbacks')
    post = models.ForeignKey('items.Post', on_delete=models.CASCADE, null=True, blank=True)
    comments = models.TextField()
    image = models.ImageField(upload_to='feedback_images/', null=True, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=[('Pending', 'Pending'), ('Checked', 'Checked')],
        default='Pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback {self.id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    post = models.ForeignKey('items.Post', on_delete=models.CASCADE, null=True, blank=True)
    comments = models.TextField()
    image = models.ImageField(upload_to='report_image/', null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('Pending', 'Pending'),('Checked', 'Checked')],
        default='Pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
        
    def __str__(self):
        return f"Report {self.id} - {self.status}"
    
class UserReport(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Waiting for Reverify', 'Waiting for Reverify'),
        ('Verified', 'Verified'),
        ('Closed', 'Closed'),
        ('Rejected', 'Rejected'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='reported_user')
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='report_sender')
    comments = models.TextField()
    image = models.ImageField(upload_to='user_report_image/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
        
    def __str__(self):
        return f"UserReport {self.id} - {self.status}"