from .models import Post
from .models import MMULocation

def create_post (post_data, user):

    post_type = post_data.get('post_type')
    location = post_data.get('post_location')

    if post_type == "found" and not location:
        raise ValueError("Location is required for Found Posts. Please state where did you found this item. ^-^")
    
    item_location = None
    
    if location:
        try:
            item_location = MMULocation.objects.get(id = location)
        
        except MMULocation.DoesNotExist:
            raise ValueError("Invalid location. Please select a location from the dropdown menu.")
    
    new_post = Post.objects.create(
        post_user = user,
        post_type = post_type,
        post_datetime = post_data.get('post_datetime'),
        post_itemcategory = post_data.get('post_itemcategory'),
        post_location = item_location,
        post_description = post_data.get('post_description'),
    )

    return new_post