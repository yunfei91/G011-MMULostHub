from .models import MMULocation, Post

def create_post(post_data,user):

    post_type = post_data.get("post_type", "").lower()
    location = post_data.get("post_location")

    if post_type == "found" and not location:
        raise ValueError("Location is required for found posts")


    new_post = Post.objects.create(
        post_user = user,
        post_type = post_type,
        post_datetime = post_data.get("post_datetime"),
        post_itemcategory = post_data.get("post_itemcategory"),
        post_location = location if location else None,
        post_description = post_data.get("post_description"),
)

    return new_post
