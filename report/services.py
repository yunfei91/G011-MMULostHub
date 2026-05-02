from .models import Feedback, Report

def create_feedback(comments, image, user):
 #a service function specifically responsible for saving feedback data to the database
    return Feedback.objects.create(
        user=user,
        comments=comments,
        image=image
    )

def create_report(user, comments, image):
    return Report.objects.create(
        user=user,
        comments=comments,
        image=image
    )
    
    