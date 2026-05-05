from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import Post

@receiver(post_delete, sender=Post)
def delete_post_image(sender, instance, **kwargs):
    if instance.post_image:
        instance.post_image.delete(save=False)

@receiver(pre_save, sender=Post)
def delete_old_image_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return  # 新建 post，不处理

    try:
        old_post = Post.objects.get(pk=instance.pk)
    except Post.DoesNotExist:
        return

    old_image = old_post.post_image
    new_image = instance.post_image

    # 如果图片被更换
    if old_image and old_image != new_image:
        old_image.delete(save=False)