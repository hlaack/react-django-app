from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType

# The location types a Point of Interest may attach to (ContentType.model names).
# Used to constrain the generic FK so a POI can only belong to one of these.
POI_PARENT_MODELS = ('region', 'geographyofinterest', 'city', 'town', 'village')

# Geography and Locations

class Region(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, help_text="Lore and details about this region.")

    # Reverse access to the POIs attached to this region. Also makes POIs
    # cascade-delete when the region is deleted.
    points_of_interest = GenericRelation('PointOfInterest')

    def __str__(self):
        return self.name

class GeographyOfInterest(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # A region can have multiple geographies of interest, but a geography of interest belongs to only one region.
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='geographies')
    points_of_interest = GenericRelation('PointOfInterest')

    class Meta:
        verbose_name_plural = "Geographies of Interest"

    def __str__(self):
        return f"{self.name} ({self.region.name})"
    
class City(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # A region can have multiple cities, but a city belongs to only one region.
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='cities')
    points_of_interest = GenericRelation('PointOfInterest')

    class Meta:
        verbose_name_plural = "Cities"

    def __str__(self):
        return self.name
    
class Town(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # A region can have multiple towns, but a town belongs to only one region.
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='towns')
    points_of_interest = GenericRelation('PointOfInterest')

    def __str__(self):
        return self.name

class Village(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # A region can have multiple villages, but a village belongs to only one region.
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='villages')
    points_of_interest = GenericRelation('PointOfInterest')

    def __str__(self):
        return self.name

class PointOfInterest(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Generic Foreign Key: a POI belongs to exactly one location, which may be
    # a Region, Geography, City, Town, or Village. content_type + object_id are
    # required, so a POI cannot exist without a parent. limit_choices_to keeps
    # the relation restricted to those location types.
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={'model__in': POI_PARENT_MODELS},
    )
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

    # Descent: a character may have up to two parents and any number of
    # children. Non-symmetrical self M2M, so `parents` and the reverse
    # `children` are distinct directions used to build the family tree.
    parents = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='children',
        blank=True,
        help_text="This character's parents (the reverse side gives their children).",
    )

    # Spouses/partners: a symmetrical self M2M, so adding one direction sets
    # both. Used to draw same-rank partner links on the family tree.
    spouses = models.ManyToManyField(
        'self',
        blank=True,
        help_text="The character's spouses or partners.",
    )

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
