from django.core.mail import send_mail
from django.conf import settings


# Feedback Email
def send_feedback_confirmation(email):
    subject = "Your Feedback Has Been Reviewed"

    message = (
        "Hello,\n\n"
        "Your feedback has been checked by our admin team.\n"
        "Thank you for your contribution.\n\n"
        "Best regards,\n"
        "MMU Lost Hub Team"
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )


# Report Email
def send_report_confirmation(email, category):
    subject = "Your Report Has Been Processed"

    message = (
        f"Hello,\n\n"
        f"Your report for '{category}' has been reviewed and processed.\n"
        f"Thank you for helping keep the system clean.\n\n"
        f"Best regards,\n"
        f"MMU Lost Hub Team"
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )