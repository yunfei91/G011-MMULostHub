from django.urls import path
form . import views

urlpatterns = [
    path('adminfeedback', views.admin_feedback_views, name='admin_feedback'),
]