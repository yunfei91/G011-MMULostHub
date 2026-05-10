from django.urls import path
from . import views

urlpatterns = [
    #Admin Mainpage
    path('admin-main/', views.admin_mainpage, name='admin_mainpage'),

    #Feedback View
    path('adminfeedback/', views.admin_feedback_view, name='admin_feedback'),

    #report View
    path('adminreport/', views.admin_report_view, name='admin_report'),

    #Actions
    path('adminfeedback/update/<int:feedback_id>/', views.update_feedback_status, name='update_feedback_status'),
    path('delete-post/<int:post_id>/', views.delete_post, name='delete_post'),
    path('admin-main/update-report/<int:report_id>/', views.update_report_status, name='update_report_status'),
]