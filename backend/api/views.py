from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import (
    Region, GeographyOfInterest, City, Town, Village, PointOfInterest,
    Family, Character, UserNote
)
from .serializers import (
    RegionSerializer, GeographyOfInterestSerializer, CitySerializer,
    TownSerializer, VillageSerializer, PointOfInterestSerializer,
    FamilySerializer, CharacterSerializer, UserNoteSerializer, UserSerializer
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
        queryset = UserNote.objects.filter(user=self.request.user)

        # Optional ?page_url= filter so a page fetches only the notes left on it.
        page_url = self.request.query_params.get('page_url')
        if page_url is not None:
            queryset = queryset.filter(page_url=page_url)

        return queryset

    def perform_create(self, serializer):
        # Automatically attach the currently logged-in user to the note upon creation
        serializer.save(user=self.request.user)

# Authentication and CSRF Token Endpoint

@ensure_csrf_cookie
@require_GET
def get_csrf_token(request):
    # @ensure_csrf_cookie forces Django to send the `csrftoken` cookie on this
    # response. The frontend calls this once on load so it has a token to send
    # back in the X-CSRFToken header on later authenticated writes.
    return JsonResponse({'detail': 'CSRF cookie set'})


class LoginView(APIView):
    # Anyone may attempt to log in; SessionAuthentication skips CSRF for
    # anonymous requests, so this works with just the credentials in the body.
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'detail': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {'detail': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Establishes the session cookie for subsequent authenticated requests.
        login(request, user)
        return Response(UserSerializer(user).data)


class RegisterView(APIView):
    # Anyone may create an account. On success the user is signed in straight
    # away, so the frontend doesn't need a separate login step.
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = (request.data.get('username') or '').strip()
        password = request.data.get('password') or ''
        email = (request.data.get('email') or '').strip()

        errors = {}
        if not username:
            errors['username'] = ['Username is required.']
        elif User.objects.filter(username__iexact=username).exists():
            errors['username'] = ['That username is already taken.']

        if not password:
            errors['password'] = ['Password is required.']
        else:
            # Enforce the project's AUTH_PASSWORD_VALIDATORS. Pass an unsaved
            # user so the similarity-to-username check can run.
            try:
                validate_password(password, user=User(username=username, email=email))
            except DjangoValidationError as exc:
                errors['password'] = list(exc.messages)

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    # Only a logged-in user can log out; this clears the session.
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CurrentUserView(APIView):
    # The frontend hits this on load to learn whether a session already exists.
    # Returns the user when authenticated, otherwise a 401 the client treats
    # as "logged out".
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return Response(
            {'detail': 'Not authenticated.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

