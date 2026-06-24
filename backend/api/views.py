from django.shortcuts import render
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET
from rest_framework import viewsets, permissions

from .models import (
    Region, GeographyOfInterest, City, Town, Village, PointOfInterest,
    Family, Character, UserNote
)
from .serializers import (
    RegionSerializer, GeographyOfInterestSerializer, CitySerializer,
    TownSerializer, VillageSerializer, PointOfInterestSerializer,
    FamilySerializer, CharacterSerializer, UserNoteSerializer
)

# Public Lore and Geography Viewsets
# Uses ReadOnlyModelViewSet to allow GET requests for all users, but restrict POST/PUT/DELETE to authenticated users only.

class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

class GeographyOfInterestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GeographyOfInterest.objects.all()
    serializer_class = GeographyOfInterestSerializer

class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer

class TownViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Town.objects.all()
    serializer_class = TownSerializer

class VillageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Village.objects.all()
    serializer_class = VillageSerializer

class PointOfInterestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PointOfInterest.objects.all()
    serializer_class = PointOfInterestSerializer

class FamilyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer

class CharacterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer

# User Features Viewsets
# Using ModelViewSet to allow full CRUD operations for authenticated users.

class UserNoteViewSet(viewsets.ModelViewSet):
    serializer_class = UserNoteSerializer
    # Ensure only logged-in users can access this endpoint
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # SECURITY: Users can ONLY fetch their own notes, no one else's.
        return UserNote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically attach the currently logged-in user to the note upon creation
        serializer.save(user=self.request.user)

# Authentication and CSRF Token Endpoint

@require_GET
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

