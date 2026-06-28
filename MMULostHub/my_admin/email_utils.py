import resend
from django.conf import settings

resend.api_key = settings.RESEND_API_KEY


def send_email(to_email, subject, html):
    resend.Emails.send({
        "from": "MMU LostHub <noreply@mmulosthub.me>",
        "to": [to_email],
        "subject": subject,
        "html": html,
    })

# Feedback Email
def send_feedback_confirmation(email):
    send_email(
        email,
        "MMU LostHub - Feedback Review Notification",
        """
        <h2>Dear User,</h2>

        <p>Your feedback submitted to MMU LostHub has been reviewed by our admin team.</p>

        <p>Thank you for helping us improve the platform.</p>

        <br>

        <p>Best regards,<br>
        MMU LostHub Team</p>
        """
    )


# Report Email
def send_report_confirmation(email, category):
    send_email(
        email,
        "MMU LostHub - Report Status Update",
        f"""
        <h2>Dear User,</h2>

        <p>Your report regarding <b>{category}</b> has been reviewed and processed by our admin team.</p>

        <p>Thank you for helping us maintain a safe and reliable platform.</p>

        <br>

        <p>Best regards,<br>
        MMU LostHub Team</p>
        """
    )

# User Report Verified Email
def send_user_report_verified_email(email):
    send_email(
        email,
        "MMU LostHub - Account Verification Required",
        """
        <h2>Dear User,</h2>

        <p>Your account has been reported.</p>

        <p>You are required to reverify your account again in your profile page.</p>

        <p>Please complete the verification process to continue using MMU LostHub.</p>

        <br>

        <p>Best regards,<br>
        MMU LostHub Team</p>
        """
    )

# Report Rejected Email
def send_report_rejected_email(email):
    send_email(
        email,
        "MMU LostHub - Report Rejected",
        """
        <h2>Dear User,</h2>

        <p>Your submitted report has been reviewed by our admin team.</p>

        <p>Unfortunately, the report was rejected because it does not violate our platform policies.</p>

        <p>Thank you for helping us maintain the platform.</p>

        <br>

        <p>Best regards,<br>
        MMU LostHub Team</p>
        """
    )


# Account Deleted Email
def send_account_deleted_email(email):
    send_email(
        email,
        "MMU LostHub - Account Disabled",
        """
        <h2>Dear User,</h2>

        <p>Your MMU LostHub account has been disabled by the admin team.</p>

        <p>If you believe this was a mistake, please contact us.</p>

        <br>

        <p>Best regards,<br>
        MMU LostHub Team</p>
        """
    )