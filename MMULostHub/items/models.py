from django.db import models

# yf-storage (Items Categories)

# ('storage name inside sqlite', 'display name on website')
CATEGORY_CHOICES = [
    (   'electronics'  ,    'Electronic Devices'),
    (   'stationary'   ,    'Stationaries'      ),
    (   'wallet'       ,    'Wallets'           ),
    (   'card'         ,    'Cards'             ),
    (   'bottle'       ,    'Water Bottles'     ),
    (   'bag'          ,    'Bags'              ),
    (   'key'          ,    'Keys'              ),
    (   'umbrella'     ,    'Umbrellas'         ),
    (   'keychain'     ,    'Keychains'         ),
    (   'clothes'      ,    'Clothes'           ),
    (   'shoes'        ,    'Shoes'             ),
    (   'accessory'    ,    'Accessories'       ),
    (   'other'        ,    'Other Items'       ),
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


# Lost and Found Post Model  
class Post (models.Model):
    
    post_type = models.CharField(choices=[('lost','Lost'),('found','Found')])

    post_datetime = models.DateTimeField()

    # Dropdown menu to choose category
    post_itemcategory = models.CharField(
        max_length = 100,
        choices = CATEGORY_CHOICES,
    )

    post_location = models.ForeignKey(
        MMULocation,
        on_delete = models.CASCADE,
        null = True,                            # database can be empty / can set in view.py to diffrentiate between lost and found post
        blank = True,                           # form can be empty
    )

    post_description = models.TextField()

    def __str__(self):
        return self.post_title
