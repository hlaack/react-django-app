from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Region, GeographyOfInterest, City, Town, Village, PointOfInterest,
    Family, Character, UserNote
)

# Authentication

class UserSerializer(serializers.ModelSerializer):
    # Minimal, safe representation of the logged-in user for the frontend.
    # Never expose password hashes, permissions, or staff flags here.
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# Geography and Locations

class MapImageSerializerMixin(serializers.Serializer):
    # Relative media URL (e.g. /media/maps/city/x.png) so the frontend can load
    # it same-origin through the Vite /media proxy.
    map_image = serializers.SerializerMethodField()

    def get_map_image(self, obj):
        return obj.map_image.url if obj.map_image else None


# Defined first so the location serializers below can nest it.
class PointOfInterestSerializer(serializers.ModelSerializer):
    # Flatten the generic FK for the frontend: a machine-readable parent type
    # (the model name, e.g. "city") and the parent's id so the UI can link back
    # to its location, plus a human-readable name for display.
    location_type = serializers.CharField(source='content_type.model', read_only=True)
    location_id = serializers.IntegerField(source='object_id', read_only=True)
    location_name = serializers.SerializerMethodField()

    class Meta:
        model = PointOfInterest
        fields = ['id', 'name', 'description', 'location_type', 'location_id', 'location_name', 'map_x', 'map_y']

    def get_location_name(self, obj):
        # The __str__ of whatever Region/City/Town/Village/Geography this is on.
        return str(obj.location_entity) if obj.location_entity else None

_LOCATION_FIELDS = [
    'id', 'name', 'description', 'region', 'points_of_interest',
    'map_x', 'map_y', 'map_image', 'map_image_width', 'map_image_height',
]

class GeographyOfInterestSerializer(MapImageSerializerMixin, serializers.ModelSerializer):
    points_of_interest = PointOfInterestSerializer(many=True, read_only=True)

    class Meta:
        model = GeographyOfInterest
        fields = _LOCATION_FIELDS

class CitySerializer(MapImageSerializerMixin, serializers.ModelSerializer):
    points_of_interest = PointOfInterestSerializer(many=True, read_only=True)

    class Meta:
        model = City
        fields = _LOCATION_FIELDS

class VillageSerializer(MapImageSerializerMixin, serializers.ModelSerializer):
    points_of_interest = PointOfInterestSerializer(many=True, read_only=True)

    class Meta:
        model = Village
        fields = _LOCATION_FIELDS

class TownSerializer(MapImageSerializerMixin, serializers.ModelSerializer):
    points_of_interest = PointOfInterestSerializer(many=True, read_only=True)

    class Meta:
        model = Town
        fields = _LOCATION_FIELDS

class RegionSerializer(MapImageSerializerMixin, serializers.ModelSerializer):
    # By nesting the serializers here, a single GET request to a Region
    # will return all the data React needs to plot the map markers!
    cities = CitySerializer(many=True, read_only=True)
    towns = TownSerializer(many=True, read_only=True)
    villages = VillageSerializer(many=True, read_only=True)
    geographies = GeographyOfInterestSerializer(many=True, read_only=True)
    points_of_interest = PointOfInterestSerializer(many=True, read_only=True)

    class Meta:
        model = Region
        fields = [
            'id', 'name', 'description', 'cities', 'towns', 'villages',
            'geographies', 'points_of_interest',
            'map_image', 'map_image_width', 'map_image_height',
        ]

# Characters and Lore

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ['id', 'name', 'description']

class CharacterSerializer(serializers.ModelSerializer):
    # Returns the full family objects rather than just an array of IDs
    # This makes building your Navigable Family Trees much easier in React
    families = FamilySerializer(many=True, read_only=True)

    # Parent/child ids so the frontend can build descent edges for the tree.
    parents = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    children = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    # Spouse ids for same-rank partner links.
    spouses = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Character
        fields = ['id', 'first_name', 'last_name', 'bio', 'families', 'parents', 'children', 'spouses']

# User features

class UserNoteSerializer(serializers.ModelSerializer):
    # We only want to send the username to the frontend, not the whole User object.
    # We also make it read_only so users can't forge notes under other usernames.
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = UserNote
        fields = ['id', 'user', 'content', 'page_url', 'created_at', 'updated_at']