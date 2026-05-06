from .models import Post
from .models import MMULocation
from datetime import datetime
from django.utils import timezone

def create_post (post_data, user):

    post_type = post_data.get('post_type')
    location = post_data.get('post_location')
    post_image = post_data.get('userposts_images')
    post_category = post_data.get('post_itemcategory')
    post_datetime_str = post_data.get('post_datetime')

    if not post_type:
        raise ValueError("Please choose Lost or Found.")

    if post_type == "found" and not location:
        raise ValueError("Location is required for Found Posts. Please state where did you found this item. ^-^")
    
    item_location = None
    
    if location:
        try:
            item_location = MMULocation.objects.get(location_code = location)
        
        except MMULocation.DoesNotExist:
            raise ValueError("Invalid location. Please select a location from the dropdown menu.")

    if not post_category:
        raise ValueError("Please choose a category for your item.")

    if not post_image:
        raise ValueError("Please Upload an image about the item ^^")
    
    if not post_datetime_str:
        raise ValueError("Please select a date and time.")

    try:
    # 把 HTML datetime-local 转成 Python datetime
        post_datetime = datetime.strptime(
            post_datetime_str,
            "%Y-%m-%dT%H:%M"
        )

    except ValueError:
        raise ValueError("Invalid date format.")

    # 转成 timezone-aware（Django 时区）
    post_datetime = timezone.make_aware(post_datetime)

    # 去掉秒数和微秒，避免误判 future datetime
    post_datetime = post_datetime.replace(
        second=0,
        microsecond=0
    )

    now = timezone.now().replace(
        second=0,
        microsecond=0
    )

    if post_datetime > now:
        raise ValueError("Datetime cannot be in the future.")
    

    
    new_post = Post.objects.create(
        post_user = user,
        post_type = post_type,
        post_datetime = post_datetime,
        post_image = post_image,
        post_itemcategory = post_category,
        post_location = item_location,
        post_description = post_data.get('post_description'),
    )

    return new_post

