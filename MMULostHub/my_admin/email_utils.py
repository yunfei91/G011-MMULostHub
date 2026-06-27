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

# User Report Verified Email
def send_user_report_verified_email(email):

    subject = "MMU LostHub - Account Verification Required"

    message = (
        "Dear User,\n\n"
        "Your account has been reported.\n\n"
        "You are required to reverify your account again in your profile page.\n\n"
        "Please complete the verification process to continue using MMU Lost Hub.\n\n"
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


# Report Rejected Email
def send_report_rejected_email(email):

    subject = "MMU LostHub - Report Rejected"

    message = (
        "Dear User,\n\n"
        "Your submitted report has been reviewed by our admin team.\n\n"
        "Unfortunately, the report was rejected because it does not violate our platform policies.\n\n"
        "Thank you for helping us maintain the platform.\n\n"
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


# Account Deleted Email
def send_account_deleted_email(email):

    subject = "MMU LostHub - Account Disabled"

    message = (
        "Dear User,\n\n"
        "Your MMU LostHub account has been disabled by the admin team.\n\n"
        "If you believe this was a mistake, please email us.\n\n"
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