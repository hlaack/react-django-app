from rest_framework import serializers
from .models import (
    Region, GeographyOfInterest, City, Town, Village, PointOfInterest,
    Family, Character, UserNote
)

# Geography and Locations

class GeographyOfInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeographyOfInterest
        fields = ['id', 'name', 'description', 'region']

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'description', 'region']

class VillageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Village
        fields = ['id', 'name', 'description', 'region']

class TownSerializer(serializers.ModelSerializer):
    class Meta:
        model = Town
        fields = ['id', 'name', 'description', 'region']

class RegionSerializer(serializers.ModelSerializer):
    # By nesting the serializers here, a single GET request to a Region 
    # will return all the data React needs to plot the map markers!
    cities = CitySerializer(many=True, read_only=True)
    towns = TownSerializer(many=True, read_only=True)
    geographies = GeographyOfInterestSerializer(many=True, read_only=True)

    class Meta:
        model = Region
        fields = ['id', 'name', 'description', 'cities', 'towns', 'geographies']

class PointOfInterestSerializer(serializers.ModelSerializer):
    # Handling the Generic Foreign Key for React:
    # Instead of sending abstract content_type IDs, we send readable strings
    location_type = serializers.CharField(source='content_type.name', read_only=True)
    location_name = serializers.SerializerMethodField()

    class Meta:
        model = PointOfInterest
        fields = ['id', 'name', 'description', 'location_type', 'location_name']

    def get_location_name(self, obj):
        # Returns the string representation of whatever City/Town/Region this is attached to
        return str(obj.location_entity) if obj.location_entity else None

# Characters and Lore

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ['id', 'name', 'description']

class CharacterSerializer(serializers.ModelSerializer):
    # Returns the full family objects rather than just an array of IDs
    # This makes building your Navigable Family Trees much easier in React
    families = FamilySerializer(many=True, read_only=True)

    class Meta:
        model = Character
        fields = ['id', 'first_name', 'last_name', 'bio', 'families']

# User features

class UserNoteSerializer(serializers.ModelSerializer):
    # We only want to send the username to the frontend, not the whole User object.
    # We also make it read_only so users can't forge notes under other usernames.
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = UserNote
        fields = ['id', 'user', 'content', 'page_url', 'created_at', 'updated_at']