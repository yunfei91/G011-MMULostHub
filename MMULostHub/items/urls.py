from django.urls import path
from . import views

urlpatterns = [
    path('', views.mainPage, name='mainPage'),
    path('createpost/', views.createPost, name='createPost'),
]