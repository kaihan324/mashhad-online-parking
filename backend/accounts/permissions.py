from rest_framework.permissions import BasePermission



class IsAdmin(BasePermission):

    def has_permission(self, request, view):

        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'



class IsParkingManager(BasePermission):

    def has_permission(self, request, view):

        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'parking_manager'



class IsUser(BasePermission):

    def has_permission(self, request, view):

        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'user'

