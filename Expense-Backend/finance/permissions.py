from rest_framework.permissions import BasePermission

class IsAdminOrReadOnlyOwner(BasePermission):
    """Admins get full access; standard users can only read their own records."""

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return obj.user_id == request.user.id and request.method in ["GET", "HEAD", "OPTIONS"]

class IsAdminOrReadOnly(BasePermission):
    """Admins get full access; everyone else gets read-only. For records with
    no per-user ownership (e.g. shared/company-wide expenses)."""

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return request.method in ["GET", "HEAD", "OPTIONS"]
