from .models import Feedback

def create_feedback(comments, image_url=None, image_name=None, user=None):

    #a service function specifically responsible for saving feedback data to the database
    feedback = Feedback(
        comments=comments,
        image_url=image_url,
        image_name=image_name,
        user=user,
        status='Pending'
    )
    feedback.save()
    return feedback