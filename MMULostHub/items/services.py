from .models import Post
from .models import MMULocation

def create_post (post_data, user):

    post_type = post_data.get('post_type')
    post_location = post_data.get('post_location')

    if post_type == "found" and not post_location:
        raise ValueError("Location is required for Found Posts. Please state whare did you found this item. ^-^")
    
    new_post = Post.objects.create(
        post_user = user,
        post_type = post_type,
        post_datetime = post_data.get('post_datetime'),
        post_itemcategory = post_data.get('post_itemcategory'),
        post_location = MMULocation.objects.get(id = post_data.get('post_location')),
        post_description = post_data.get('post_description'),
    )

    return new_post

