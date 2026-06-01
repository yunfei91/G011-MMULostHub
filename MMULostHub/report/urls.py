from django.urls import path
from .views import feedback_form_view
from . import views

urlpatterns = [
    path('feedback/', feedback_form_view, name='feedback_form'),
    path('submit_report/', views.submit_report, name='submit_report')
]