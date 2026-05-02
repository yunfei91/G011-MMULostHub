from django.contrib import admin
from .email_utils import send_report_confirmation, send_feedback_confirmation
from report.models import Feedback, Report



@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'comments']
    actions = ['mark_reports_as_checked_and_send_email']

    @admin.action(description='Mark selected as Checked and Send Email')
    def mark_reports_as_checked_and_send_email(self, request, queryset):
        for report in queryset:
            if report.status == 'Pending':
              
              email = report.user.email if report.user else None

              if email:
                  send_report_confirmation(
                      email,
                      report.post.get_post_itemcategory_display() if report.post else "Unknown"
                  )

              report.status = 'Checked'
              report.save()

        self.message_user(request, "Reports updated and confirmation emails sent.")


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_email_display', 'comments', 'status', 'created_at')
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'comments']
    actions = ['mark_feedbacks_as_checked_and_send_email']

    def user_email_display(self, obj):
        return obj.user.email if obj.user and obj.user.email else "Anonymous"
    user_email_display.short_description = 'User Email'

    @admin.action(description='Mark selected Feedbacks as Checked and Send Email')
    def mark_feedbacks_as_checked_and_send_email(self, request, queryset):

        for feedback in queryset:
        
            if feedback.status == 'Pending':
                email = getattr(feedback.user, "email", None)
                
                if email:
                    send_feedback_confirmation(email)
                    
                feedback.status = 'Checked'
                feedback.save()
             
                    
        self.message_user(request, "Feedbacks processed and confirmation emails sent.")