from .models import Post, PostImage, MMULocation
from datetime import datetime
from django.utils import timezone

# ======================================================
#            Create Post Beckend Services
# ======================================================
def create_post (post_data, user):

    post_type = post_data.get('post_type')
    location = post_data.get('post_location')
    post_category = post_data.get('post_itemcategory')
    post_datetime_str = post_data.get('post_datetime')
    images = post_data.get('images', [])

    # ======================================================
    #                 Check Post Type 
    # ======================================================
    # Empty or not
    if not post_type:
        raise ValueError("Please choose Lost or Found.")

    # Post = found but no location = error
    if post_type == "found" and not location:
        raise ValueError("Location is required for Found Posts. Please state where did you found this item. ^-^")
    
    # ======================================================
    #                 Check Empty Location
    # ======================================================
    item_location = None
    
    if location:
        try:
            item_location = MMULocation.objects.get(location_code = location)
        
        except MMULocation.DoesNotExist:
            raise ValueError("Invalid location. Please select a location from the dropdown menu.")

    # ======================================================
    #                 Check Empty Category
    # ======================================================
    if not post_category:
        raise ValueError("Please choose a category for your item.")

    # ======================================================
    #                 Check Empty Image 
    # ======================================================
    if not images:
        raise ValueError("Please upload at least one image.")
    
    # ======================================================
    #                 Check Date Time
    # ======================================================
    # Empty anot
    if not post_datetime_str:
        raise ValueError("Please select a date and time.")

    # Date Time format
    try:
        post_datetime = datetime.strptime(
            post_datetime_str,
            "%Y-%m-%dT%H:%M"
        )
    except ValueError:
        raise ValueError("Invalid date format.")


    post_datetime = timezone.make_aware(post_datetime)

    # Change all input second to 0
    post_datetime = post_datetime.replace(
        second=0,
        microsecond=0
    )

    # Get timezone now and cahange all second to 0
    now = timezone.now().replace(
        second=0,
        microsecond=0
    )

    # Future Date Time = error
    if post_datetime > now:
        raise ValueError("Datetime cannot be in the future.")
    

    # ======================================================
    #             Save Post Date to Database
    # ======================================================
    new_post = Post.objects.create(
        post_user = user,
        post_type = post_type,
        post_datetime = post_datetime,
        post_itemcategory = post_category,
        post_location = item_location,
        post_description = post_data.get('post_description'),
    )

    # create empty list to save uploaded iamges
    saved_images = []

    # enumareate = automatic assign number for each image  accrodeing to index+1
    for index, img in enumerate(images):

        # create post image and save to database
        post_image = PostImage.objects.create(
            post = new_post,
            image = img,
            order = index
        )

        saved_images.append(post_image)

    # first image = cover image
    if saved_images:

        new_post.cover_image = saved_images[0]

        new_post.save()

    return new_post

# ======================================================
#             Edit Post Beckend Services
# ======================================================
def edit_post(post, data):
    post_type = data.get('post_type')
    post_datetime_str = data.get('post_datetime')
    post_category = data.get('post_itemcategory')
    location = data.get('post_location')
    post_description = data.get('post_description') or ""
    
    # ======================================================
    #                 Check Post Type
    # ======================================================
    # Empty or not
    if not post_type:
        raise ValueError("Please choose Lost or Found.")

    # Post = found but no location = error
    if post_type == "found" and not location:
        raise ValueError("Location is required for Found Posts. Please state where did you found this item. ^-^")
    
    # ======================================================
    #                 Check Empty Location
    # ======================================================
    item_location = None
    if location:
        try:
            item_location = MMULocation.objects.get(location_code = location)
        except MMULocation.DoesNotExist:
            raise ValueError("Invalid location. Please select a location from the dropdown menu.")

    # ======================================================
    #                 Check Empty Category
    # ======================================================
    if not post_category:
        raise ValueError("Please choose a category for your item.")
    
    # ======================================================
    #                 Check Date Time
    # ======================================================
    # Empty anot
    if not post_datetime_str:
        raise ValueError("Please select a date and time.")
    
    post_datetime = datetime.fromisoformat(post_datetime_str)
    post_datetime = timezone.make_aware(post_datetime)

    # Future Date Time = error
    if post_datetime > timezone.now():
        raise ValueError("Datetime cannot be in the future.")
    
    # ======================================================
    #             Update and Save Post Data to Database
    # ======================================================
    post.post_type = post_type
    post.post_datetime = post_datetime
    post.post_itemcategory = post_category
    post.post_location = item_location
    post.post_description = post_description

    post.save()

    # get data from vies.py
    images_order = data.get('images_order', [])
    existing_ids = data.get('existing_ids', [])

    # delete removed old images
    post.images.exclude(id__in=existing_ids).delete()

    # create new empty list for new edited and old images to save in database
    final_images = []

    for item in images_order:

        # old image
        if item["type"] == "existing":

            img = post.images.filter(id=item["id"]).first()
            if img:
                img.order = item["order"]
                img.save()
                final_images.append(img)

        # new uploaded image
        elif item["type"] == "new":

            post_image = PostImage.objects.create(
                post = post,
                image = item["file"],
                order = item["order"]
            )

            # save all images inside new list
            final_images.append(post_image)

    # arrange all iages inside finalimages list by their order
    final_images.sort(key=lambda x: x.order)

    # set cover image
    if final_images:
        post.cover_image = final_images[0]
        
    else:
        post.cover_image = None

    if post.cover_image and not post.images.filter(id=post.cover_image.id).exists():
        post.cover_image = None

    post.save()

    return post
    
 
