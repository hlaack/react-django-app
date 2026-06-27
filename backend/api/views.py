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
from rest_framework.decorators import action

from .models import (
    Region, GeographyOfInterest, City, Town, Village, PointOfInterest,
    Family, Character, UserNote
)
from .serializers import (
    RegionSerializer, GeographyOfInterestSerializer, CitySerializer,
    TownSerializer, VillageSerializer, PointOfInterestSerializer,
    FamilySerializer, CharacterSerializer, UserNoteSerializer, UserSerializer,
    ManagedUserSerializer
)
from .permissions import IsStaffOrReadOnly, IsSuperuser

# Lore and Geography Viewsets
# Full CRUD, but IsStaffOrReadOnly keeps writes to staff while reads stay public.

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsStaffOrReadOnly]

class GeographyOfInterestViewSet(viewsets.ModelViewSet):
    queryset = GeographyOfInterest.objects.all()
    serializer_class = GeographyOfInterestSerializer
    permission_classes = [IsStaffOrReadOnly]

class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [IsStaffOrReadOnly]

class TownViewSet(viewsets.ModelViewSet):
    queryset = Town.objects.all()
    serializer_class = TownSerializer
    permission_classes = [IsStaffOrReadOnly]

class VillageViewSet(viewsets.ModelViewSet):
    queryset = Village.objects.all()
    serializer_class = VillageSerializer
    permission_classes = [IsStaffOrReadOnly]

class PointOfInterestViewSet(viewsets.ModelViewSet):
    queryset = PointOfInterest.objects.all()
    serializer_class = PointOfInterestSerializer
    permission_classes = [IsStaffOrReadOnly]

# Full CRUD for characters and families too; IsStaffOrReadOnly keeps writes
# staff-only while reads stay public. Relations (families/parents/spouses) are
# edited through the write-only id fields on CharacterSerializer.

class FamilyViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer
    permission_classes = [IsStaffOrReadOnly]

class CharacterViewSet(viewsets.ModelViewSet):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer
    permission_classes = [IsStaffOrReadOnly]

# User Management (superusers only)

class ManagedUserViewSet(viewsets.ModelViewSet):
    # Superuser-only account management. Supports listing, toggling is_staff /
    # is_active, deleting, and resetting passwords. Account creation is not
    # offered here (registration handles that). Guardrails stop a superuser from
    # locking themselves out.
    queryset = User.objects.all().order_by('username')
    serializer_class = ManagedUserSerializer
    permission_classes = [IsSuperuser]

    def create(self, request, *args, **kwargs):
        return Response(
            {'detail': 'Create accounts through registration, not here.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def update(self, request, *args, **kwargs):
        # Prevent self-lockout: can't drop your own staff/active flags.
        if self.get_object() == request.user:
            if request.data.get('is_active') is False:
                return Response(
                    {'detail': "You can't deactivate your own account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if request.data.get('is_staff') is False:
                return Response(
                    {'detail': "You can't revoke your own staff access."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if self.get_object() == request.user:
            return Response(
                {'detail': "You can't delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None):
        target = self.get_object()
        password = request.data.get('password') or ''
        try:
            validate_password(password, user=target)
        except DjangoValidationError as exc:
            return Response({'password': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
        target.set_password(password)
        target.save(update_fields=['password'])
        return Response({'detail': 'Password updated.'})

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

