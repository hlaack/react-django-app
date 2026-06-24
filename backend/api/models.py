from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# Geography and Locations

class Region(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, help_text="Lore and details about this region.")

    def __str__(self):
        return self.name
    
class GeographyOfInterest(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # A region can have multiple geographies of interest, but a geography of interest belongs to only one region.
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='geographies')

    class Meta:
        verbose_name_plural = "Geographies of Interest"

    def __str__(self):
        return f"{self.name} ({self.region.name})"
    
class City(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # A region can have multiple cities, but a city belongs to only one region.
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='cities')

    class Meta:
        verbose_name_plural = "Cities"

    def __str__(self):
        return self.name
    
class Town(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # A region can have multiple towns, but a town belongs to only one region.
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='towns')

    def __str__(self):
        return self.name
    
class Village(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # A region can have multiple villages, but a village belongs to only one region.
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='villages')

    def __str__(self):
        return self.name

class PointOfInterest(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Generic Foreign Key
    # Lets POI only belong to one of either a single Region, City, Town, Village, etc.
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    location_entity = GenericForeignKey('content_type', 'object_id')

    class Meta:
        verbose_name_plural = "Points of Interest"

    def __str__(self):
        return f"{self.name} [{self.content_type.name}]"

# Characters and Lore

class Family(models.Model):
    name = models.CharField(max_length=255, help_text="Family, Clan, or House name.")
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Families"

    def __str__(self):
        return self.name
    
class Character(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)

    # A family can have many characters, and a character can be attached to many families.
    families = models.ManyToManyField(Family, related_name='members', blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()
    
# User features

class UserNote(models.Model):
    # A user can have many UserNotes, but a UserNote belongs to only one user.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaign_notes')
    content = models.TextField(help_text="The private campaign note content.")

    # Store exact URL path where the note was left.
    # Helpful for decoupled React frontend.
    page_url = models.CharField(max_length=500, help_text="The frontend URL slug where this note is displayed.")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note by {self.user.username} on {self.page_url}"
