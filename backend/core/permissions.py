from rest_framework import permissions


def _role(user):
    return getattr(user, 'role', None)


class IsAdmin(permissions.BasePermission):
    """PACKORA staff only."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, 'is_admin', False))


class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and _role(request.user) == 'customer'
        )


class IsSupplier(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and _role(request.user) == 'supplier'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Object-level: owner (user/customer FK) or admin. Pair with get_queryset
    filtering — this guards detail routes like /orders/<id>/."""

    owner_field = 'customer'  # override per view when the FK differs

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if _role(request.user) == 'admin' or request.user.is_staff:
            return True
        owner = getattr(obj, self.owner_field, None)
        if owner is None:
            owner = getattr(obj, 'user', None)
        if owner is None:
            return False
        return owner == request.user or getattr(owner, 'user', None) == request.user
