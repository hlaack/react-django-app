from rest_framework import permissions


class IsStaffOrReadOnly(permissions.BasePermission):
    """Anyone may read; only staff users may create, update, or delete."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)
