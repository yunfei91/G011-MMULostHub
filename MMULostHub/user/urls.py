from django.urls import path
from user import views

urlpatterns = [
    path('', views.beginning, name='beginning'),
    path('user-login/', views.user_login, name='user-login'),
    path('admin-login/', views.admin_login, name='admin-login'),
    path('register/', views.register, name='register'),
    path('check-email/', views.check_email, name='check_email'),
    path('check-name/', views.check_name, name='check_name'),

    path('email-verify/', views.verify_email, name='verify_email'),
    path('resend-otp/', views.resend_otp, name='resend_otp'),

    path('mmu-verify/', views.mmu_verify, name='mmu_verify'),

    path('profile/', views.profile, name='profile'),
    path('update-bio/', views.update_bio, name='update_bio'),
    path('update-avatar/', views.update_avatar, name='update_avatar'),
    path('update-name/', views.update_name, name='update_name'),

    path('logout/', views.user_logout, name='logout'),
]

from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)