from django.urls import path
from user import views

urlpatterns = [
    path('', views.beginning, name='beginning'),
    path('user-login/', views.user_login, name='user_login'),
    path('admin-login/', views.admin_login, name='admin_login'),
    path('register/', views.register, name='register'),
    path('check-email/', views.check_email, name='check_email'),
    path('check-name/', views.check_name, name='check_name'),

    path('forgot-pw/', views.forgot_pw, name='forgot_pw'),
    path('reset-otp-verify/', views.reset_otp_verify, name='reset_otp_verify'),
    path('reset-pw/', views.reset_pw, name='reset_pw'),
    path('resend-reset-otp/', views.resend_reset_otp, name='resend_reset_otp'),

    path('email-verify/', views.verify_email, name='verify_email'),
    path('resend-otp/', views.resend_otp, name='resend_otp'),

    path('profile/', views.profile, name='profile'),
    path('profile/<int:user_id>/', views.profile, name='view_profile'), #zinc support others view profile
    path('update-bio/', views.update_bio, name='update_bio'),
    path('update-avatar/', views.update_avatar, name='update_avatar'),
    path('update-name/', views.update_name, name='update_name'),

    #zinc add to report user
    path('report-user/<int:user_id>/', views.report_user, name='report_user'),
    
    # yunfee add to check other user's profile
    path('profile/<str:username>/', views.userProfile, name='userProfile'),

    path('logout/', views.user_logout, name='logout'),
]

from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)