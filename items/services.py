from .models import Post
from .models import MMULocation

def create_post (post_data, user):

    post_type = post_data.get('post_type')
    location = post_data.get('post_location')

    if not post_type:
        raise ValueError("Post type is required.")

    if not post_data.get('post_itemcategory'):
        raise ValueError("Category is required.")

    if post_type == "found" and location is None:
        raise ValueError("Location is required for Found Posts. Please state where did you found this item. ^-^")
    
    item_location = location
    
    new_post = Post.objects.create(
        post_user = user,
        post_type = post_type,
        post_itemcategory = post_data.get('post_itemcategory'),
        post_location = item_location,
        post_description = post_data.get('post_description'),
    )

    return new_post