from django.core.mail import send_mail
from django.conf import settings


def send_report_confirmation(reporter_email, category_display):
    subject = "MMULostHub - Report Acknowledged"
    message = f"""Hello,

This is an automated message from MMULostHub Admin.
We have received and reviewed your report regarding a(n) {category_display}.

Our team is currently looking into it.
Thank you for helping keep MMU community safe!
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [reporter_email],
        fail_silently=False,
    )


def send_feedback_confirmation(user_email):
    subject = "MMULostHub - Feedback Acknowledged"
    message = """Hello,

This is an automated message from MMULostHub Admin.
We have received your feedback.

Thank you for your valuable input.
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user_email],
        fail_silently=False,
    )