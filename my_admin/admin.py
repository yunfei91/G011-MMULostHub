from django.contrib import admin
from report.models import Feedback
from .email_utils import send_feedback_confirmation 

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_email_display', 'comments', 'status', 'created_at')
    actions = ['mark_feedbacks_as_checked_and_send_email']

    def user_email_display(self, obj):
        return obj.user.email if obj.user and obj.user.email else "Anonymous"
    user_email_display.short_description = 'User Email'

    @admin.action(description='Mark selected Feedbacks as Checked and Send Email')
    def mark_feedbacks_as_checked_and_send_email(self, request, queryset):

        for feedback in queryset:
        
            if feedback.status == 'Pending':
                to_email = None
                if feedback.user and feedback.user.email:
                    to_email = feedback.user.email
                
                if to_email:
                    success = send_feedback_confirmation(to_email)
                    
                    if success:
                        feedback.status = 'Checked'
                        feedback.save()
                else:
                    feedback.status = 'Checked'
                    feedback.save()
                    
        self.message_user(request, "Selected feedbacks processed and confirmation emails sent.")
