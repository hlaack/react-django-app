from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# DRF router for automatically generating URL patterns for our viewsets
# for example, /api/regions/ will be handled by RegionViewSet, /api/cities/ by CityViewSet, etc.

router = DefaultRouter()
router.register(r'regions', views.RegionViewSet)
router.register(r'geographies', views.GeographyOfInterestViewSet)
router.register(r'cities', views.CityViewSet)
router.register(r'towns', views.TownViewSet)
router.register(r'villages', views.VillageViewSet)
router.register(r'pois', views.PointOfInterestViewSet)
router.register(r'families', views.FamilyViewSet)
router.register(r'characters', views.CharacterViewSet)

# Need to provide a basename due to override

router.register(r'user-notes', views.UserNoteViewSet, basename='usernote')

urlpatterns = [
    # Include the router-generated URLs for our API endpoints
    path('', include(router.urls)),

    path('csrf/', views.get_csrf_token, name='csrf-token'),
]

#TODO move on to phase 3.
