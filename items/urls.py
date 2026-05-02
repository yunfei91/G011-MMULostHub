from django.urls import path
from . import views
from .views import create_post_view

urlpatterns = [
    path('mainpage/', views.mainPage, name='mainPage'),
    path("create/", create_post_view, name="create_post_view"),
    
]