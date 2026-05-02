from django.urls import path
from user import views

urlpatterns = [
    path('', views.beginning, name='beginning'),
    path('user-login/', views.user_login, name='user-login'),
    path('admin-login/', views.admin_login, name='admin-login'),
    path('register/', views.register, name='register'),
    path('check-email/', views.check_email, name='check_email'),
    path('profile/', views.profile, name='profile'),
    path('update-bio/', views.update_bio, name='update_bio'),
    path('logout/', views.user_logout, name='logout'),
]