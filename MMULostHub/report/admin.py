from django.contrib import admin
from report.models import Feedback, Report
# from my_admin.email_utils import send_feedback_confirmation


class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'comments', 'status', 'created_at')


class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'status', 'created_at')


admin.site.register(Feedback, FeedbackAdmin)
admin.site.register(Report, ReportAdmin)