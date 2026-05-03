from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import MMULocation

LOCATIONS = [
    "FCI Building",
    "FOM Building",
    "FAIE Building",
    "FCM Building",
    "CLC",
    "MPH / Annex Hall",
    "Misri Plaza",
    "rimbun-ilmu",
    "Dewan Tun Chanselor",
    "MMU Chancelery Building",
    "STAD Building",
    "IPS Building",
    "Library",
    "Bakery",
    "Haji Tapah",
    "Starbees",
    "Deen's Cafe",
    "Dapo Sahang",
    "Hostel Block 1",
    "Hostel Block 2",
    "Hostel Block 3",
    "Hostel Block 4",
    "MMU Entrance A",
    "MMU Entrance B",
    "Bustop Entrance A",
    "Bustop Entrance B",
    "MMU Cyberpark",
    "MMU Stadium",
    "Indoor Sports Centre",
    "Football Field",
    "Rugby Field",
    "Swimming Pool",
    "Tennis Court",
    "Basketball Court",
    "Volleyball Court",
    "Archery",
    "EDC Building",
    "FMD Building",
    "Masjid",
    "NEA",
    "EAA",
    "EAB",
    "MMU Guest House",
]

@receiver(post_migrate)
def create_locations(sender, **kwargs):
    if sender.name != "items":
        return

    for name in LOCATIONS:
        MMULocation.objects.get_or_create(
            location_name=name,
            location_code=name
        )