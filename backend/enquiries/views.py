from django.conf import settings
from django.core.mail import send_mail
from rest_framework import permissions, viewsets

from accounts.models import User
from core.permissions import IsAdmin

from .models import Enquiry
from .serializers import EnquiryCreateSerializer, EnquirySerializer


def notify_admins(enquiry):
    """Email all staff about a new enquiry. fail_silently keeps the
    API response unaffected if mail isn't configured."""
    recipients = list(
        User.objects.filter(is_staff=True)
        .exclude(email='')
        .values_list('email', flat=True)
    )
    if not recipients:
        return
    send_mail(
        subject=f'New PACKORA enquiry {enquiry.reference}: {enquiry.subject}',
        message=(
            f'Reference: {enquiry.reference}\n'
            f'From: {enquiry.name} <{enquiry.email}>\n'
            f'Phone: {enquiry.phone}\n'
            f'Company: {enquiry.company_name}\n'
            f'Category: {enquiry.product_category or "—"}\n'
            f'Quantity: {enquiry.quantity or "—"}\n'
            f'Delivery: {enquiry.delivery_location or "—"}\n\n'
            f'{enquiry.message}\n\n'
            f'Attachments: {enquiry.attachments.count()} file(s)\n'
            f'Admin: {settings.FRONTEND_URL if hasattr(settings, "FRONTEND_URL") else "http://localhost:5173/admin"}'
        ),
        from_email=None,
        recipient_list=recipients,
        fail_silently=True,
    )


class EnquiryViewSet(viewsets.ModelViewSet):
    """POST is public (guest enquiries allowed). GET list is scoped:
    customers see only their own; admins see everything.
    Writes beyond create are admin-only."""

    serializer_class = EnquirySerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return EnquiryCreateSerializer
        return EnquirySerializer

    def get_queryset(self):
        qs = Enquiry.objects.select_related('customer').prefetch_related(
            'attachments',
        )
        user = self.request.user
        if user.is_authenticated and user.is_admin:
            return qs
        if user.is_authenticated:
            return qs.filter(customer=user)
        return qs.none()

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action in ('update', 'partial_update'):
            return [IsAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        enquiry = serializer.save()
        notify_admins(enquiry)
