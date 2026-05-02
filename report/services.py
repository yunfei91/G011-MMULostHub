from .models import Feedback

def create_feedback(comments, image=None, user=None):

    #a service function specifically responsible for saving feedback data to the database
    feedback = Feedback(
        comments=comments,
        image=image,
        user=user,
        status='Pending'
    )
    feedback.save()
    return feedback