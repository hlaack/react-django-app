from django.contrib import admin
from .models import (
    Region, GeographyOfInterest, City, Town, Village, PointOfInterest,
    Family, Character, UserNote
)

# Geography and Locations

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(GeographyOfInterest)
class GeographyOfInterestAdmin(admin.ModelAdmin):
    list_display = ('name', 'region')
    list_filter = ('region',)
    search_fields = ('name',)

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name', 'region')
    list_filter = ('region',)
    search_fields = ('name',)

@admin.register(Town)
class TownAdmin(admin.ModelAdmin):
    list_display = ('name', 'region')
    list_filter = ('region',)
    search_fields = ('name',)

@admin.register(Village)
class VillageAdmin(admin.ModelAdmin):
    list_display = ('name', 'region')
    list_filter = ('region',)
    search_fields = ('name',)

@admin.register(PointOfInterest)
class PointOfInterestAdmin(admin.ModelAdmin):
    list_display = ('name', 'content_type', 'object_id', 'get_location')
    list_filter = ('content_type',)
    search_fields = ('name',)

    # Display linked location within list view
    def get_location(self, obj):
        return obj.location_entity
    get_location.short_description = 'Attached Location'

# Characters and Lore

@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name')
    search_fields = ('first_name', 'last_name')
    filter_horizontal = ('families',)

# User features

@admin.register(UserNote)
class UserNoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'page_url', 'created_at', 'updated_at')
    list_filter = ('created_at', 'user')
    search_fields = ('page_url', 'content', 'user__username')
    readonly_fields = ('created_at', 'updated_at')

