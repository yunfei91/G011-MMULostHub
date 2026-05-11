from django.db.models.signals import post_delete, pre_save              # postdelete = active when delete post | presave = active before save post
from django.dispatch import receiver                                    # signal decprator to connect and auto run this function when signal is active
from .models import Post

# ======================================================
#        Check and Update Image Input in DataBase
# ======================================================

# when delete post run this function
@receiver(post_delete, sender=Post)
def delete_post_image(sender, instance, **kwargs):          # instance = post delete now
    if instance.post_image:                                 # check instance post hv image ornot
        instance.post_image.delete(save=False)              # dlt image saved in database = media/userposts_images/

# When Create/Update post run this function
@receiver(pre_save, sender=Post)
def delete_old_image_on_change(sender, instance, **kwargs):
    if not instance.pk:                                     # if new post then stop function
        return 

    try:
        old_post = Post.objects.get(pk=instance.pk)         # get old post imae data from database
    
    except Post.DoesNotExist:                               # if post not exist then stop function                                               
        return

    old_image = old_post.post_image
    new_image = instance.post_image

    if old_image and old_image != new_image:               # old image exist and noew image diff from old 
        old_image.delete(save=False)                       # dlt old and save new in database = media/userposts_images/