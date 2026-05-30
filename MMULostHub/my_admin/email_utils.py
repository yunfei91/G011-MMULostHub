from django.core.mail import send_mail 
from django.conf import settings


# Feedback Email
def send_feedback_confirmation(email):
    subject = "MMU LostHub - Feedback Review Notification"

    message = (
        "Dear User,\n\n"
        "Your feedback submitted to MMU LostHub has been reviewed by our admin team.\n\n"
        "Thank you for helping us improve the platform.\n\n"
        "Best regards,\n"
        "MMU LostHub Team\n"
        "This is an automated email. Please do not reply."
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )


# Report Email
def send_report_confirmation(email, category):
    subject = "MMU LostHub - Report Status Update"

    message = (
        f"Dear User,\n\n"
        f"Your report regarding '{category}' has been reviewed and processed by our admin team.\n\n"
        f"Thank you for helping us maintain a safe and reliable platform.\n\n"
        f"Best regards,\n"
        f"MMU LostHub Team\n"
        f"This is an automated email. Please do not reply."
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )