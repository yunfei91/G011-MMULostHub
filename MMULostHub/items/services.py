from .models import ItemCategory
from .models import MMULocation

def createItem (itemName, description, itemCategory):
    return ItemCategory.objects.create(
        itemName = itemName,
        description = description,
        itemCategory = itemCategory,
    )

def getAllItems ():
    return ItemCategory.objects.all()

def getItem_by_category(itemCategory):
    return ItemCategory.objects.filter(itemCategory = itemCategory)