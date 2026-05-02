from django.core.mail import send_mail

def send_test_email():
    send_mail(
        subject="MMULostHub API Test Connection",
        message="This is a test email from MMULostHub using SMTP.",
        from_email=None,
        recipient_list=["adminlosthub@gmail.com"],
        fail_silently=False,
    )