"""
URL configuration for MMULostHub project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path
from django.urls import include
from user import views
from django.contrib import admin

urlpatterns = [
    # yt urls
    path('', views.beginning, name='beginning'),
    path('user-login/', views.user_login, name='user-login'),
    path('admin-login/', views.admin_login, name='admin-login'),
    path('register/', views.register, name='register'),
    path('check-email/', views.check_email, name='check_email'),

    # yf urls
    path('items/', include('items.urls')),

    # ty urls
    path('report/',include('report.urls')),
    path('admin/', admin.site.urls),
]

