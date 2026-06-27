from django.db import models
from django.contrib.auth.models import User
import os
from utils.supabase import upload_to_supabase

# ('storage name inside sqlite', 'display name on website')
CATEGORY_CHOICES = [
    (   'Electronic Devices'  ,    'Electronic Devices'),
    (   'Stationaries'        ,    'Stationaries'      ),
    (   'Wallets'             ,    'Wallets'           ),
    (   'Cards'               ,    'Cards'             ),
    (   'Water Bottles'       ,    'Water Bottles'     ),
    (   'Bags'                ,    'Bags'              ),
    (   'Keys'                ,    'Keys'              ),
    (   'Umbrellas'           ,    'Umbrellas'         ),
    (   'Keychains'           ,    'Keychains'         ),
    (   'Clothes'             ,    'Clothes'           ),
    (   'Shoes'               ,    'Shoes'             ),
    (   'Accessories'         ,    'Accessories'       ),
    (   'Others'              ,    'Other Items'       ),
]

# MMU Location Model
class MMULocation (models.Model):
    
    location_code = models.CharField(                   # system or url(weblink) will see
        max_length = 50,
        unique = True,
    )

    location_name = models.CharField(                   # user see
        max_length = 100,
    )

    latitude = models.FloatField(                       # coordinates (lat , long)
        null = True,
        blank = True,
    )

    longitude = models.FloatField(
        null = True,
        blank = True,
    )

    # Display name of the item on the admin page
    # Contoh : √ Laptop ✗ Item Obeject 1
    def __str__(self):
        return self.location_name
    
def post_image_path(instance, filename):

    return os.path.join(
        "userposts_images",
        f"post_{instance.post.id}",
        filename
    )

class PostImage(models.Model):

    post = models.ForeignKey(
        'Post',
        on_delete=models.CASCADE,
        related_name="images"
    )

    image_url = models.URLField(max_length=500, null=True, blank=True)

    order = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):

        if self.image and hasattr(self.image, "read"):
            url = upload_to_supabase(self.image)
            self.image = url

        super().save(*args, **kwargs)

# Lost and Found Post Model  
class Post (models.Model):

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('returned', 'Returned'),
        ('claimed', 'Claimed'),
    ]

    post_user = models.ForeignKey(
        User,
        on_delete = models.CASCADE,                             # if user deleted , all related post or data also will be deleted
        null = False,                            
        blank = False,
    )
    
    post_type = models.CharField(
        max_length = 10,
        choices = [('lost','Lost'), ('found','Found')],
        null = False,                            
        blank = False,
    )

    post_datetime = models.DateTimeField(
        null = False,                            
        blank = False,
    )

    # Dropdown menu to choose category
    post_itemcategory = models.CharField(
        max_length = 100,
        choices = CATEGORY_CHOICES,
        null = False,
        blank = False,
    )

    post_location = models.ForeignKey(
        MMULocation,
        on_delete = models.SET_NULL,
        null = True,                            # database can be empty / can set in view.py to diffrentiate between lost and found post
        blank = True,                           # form can be empty
    )

    post_description = models.TextField()

    post_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )

    cover_image = models.ForeignKey(
        'PostImage',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cover_posts'
    )

    def __str__(self):
        return f"{self.post_type}: {self.post_itemcategory}"

# yt added
    @property
    def sorted_images(self):
        return self.images.all().order_by("order")