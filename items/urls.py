from django.urls import path
from . import views

urlpatterns = [
    path('', views.mainPage, name='mainPage'),
    path('createpost/', views.create_post_view, name='create_post_view'),
]