import django_filters
from django.utils import timezone
from rest_framework import permissions, viewsets

from core.permissions import IsAdmin

from .models import Quotation
from .serializers import (
    QuotationSerializer,
    QuotationWriteSerializer,
)


class QuotationFilter(django_filters.FilterSet):
    class Meta:
        model = Quotation
        fields = {
            'status': ['exact'],
            'customer': ['exact'],
            'valid_until': ['gte', 'lte'],
        }


class QuotationViewSet(viewsets.ModelViewSet):
    """Admins manage all quotations. Customers can only list/retrieve
    their own (read-only) — they must never see drafts or other customers."""

    filterset_class = QuotationFilter
    ordering_fields = ['created_at', 'total', 'valid_until']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.user.is_admin and self.action in (
            'create', 'update', 'partial_update',
        ):
            return QuotationWriteSerializer
        return QuotationSerializer

    def get_queryset(self):
        qs = Quotation.objects.select_related('customer').prefetch_related(
            'items',
        )
        user = self.request.user
        if user.is_authenticated and user.is_admin:
            return qs
        if user.is_authenticated:
            return qs.filter(customer=user).exclude(status='draft')
        return qs.none()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        instance = serializer.save()
        # Expire lazily: mark past-valid quotes as expired on write.
        if (
            instance.valid_until
            and instance.valid_until < timezone.now().date()
            and instance.status in (Quotation.Status.SENT, Quotation.Status.DRAFT)
        ):
            instance.status = Quotation.Status.EXPIRED
            instance.save(update_fields=['status', 'updated_at'])
