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

    # Session auth: get a CSRF cookie, then log in / out / check the session.
    path('csrf/', views.get_csrf_token, name='csrf-token'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current-user'),
]
