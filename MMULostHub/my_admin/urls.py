from django.urls import path
from .views import admin_feedback_view

urlpatterns = [
    path('adminfeedback/', admin_feedback_view, name='admin_feedback'),
]