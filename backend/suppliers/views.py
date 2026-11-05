import django_filters
from rest_framework import viewsets

from core.permissions import IsAdmin

from .models import Supplier
from .serializers import SupplierSerializer


class SupplierFilter(django_filters.FilterSet):
    class Meta:
        model = Supplier
        fields = {
            'is_active': ['exact'],
            'city': ['exact', 'icontains'],
            'country': ['exact'],
        }


class SupplierViewSet(viewsets.ModelViewSet):
    """Admin-only. Supplier records contain commercial terms — never
    expose to customers or suppliers themselves."""

    serializer_class = SupplierSerializer
    queryset = Supplier.objects.all()
    permission_classes = [IsAdmin]
    filterset_class = SupplierFilter
    search_fields = ['company_name', 'contact_name', 'supplies']
    ordering_fields = ['company_name', 'created_at']
