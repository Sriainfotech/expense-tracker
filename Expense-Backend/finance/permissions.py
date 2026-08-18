from rest_framework.permissions import BasePermission

class IsAdminOrReadOnlyOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return obj.user_id == request.user.id and request.method in ["GET", "HEAD", "OPTIONS"]

class IsAdminOrOwnerExpenseCreate(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return obj.user_id == request.user.id and request.method in ["GET", "HEAD", "OPTIONS"]
