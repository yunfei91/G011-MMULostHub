from django.core.management.base import BaseCommand
from items.models import MMULocation

class Command(BaseCommand):
    def handle(self, *args, **kwargs):

        locations = [
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

        for loc in locations:
            MMULocation.objects.get_or_create(
                location_code=loc,
                defaults={"location_name": loc}
            )

        self.stdout.write(self.style.SUCCESS("Locations seeded!"))