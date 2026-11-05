import uuid

from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils import timezone

from accounts.models import User
from core.models import TimestampMixin
from products.models import Category

ATTACHMENT_VALIDATORS = [
    FileExtensionValidator(
        allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    ),
]
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB


def enquiry_reference():
    return f'ENQ-{timezone.now():%Y%m}-{uuid.uuid4().hex[:6].upper()}'


class Enquiry(TimestampMixin):
    """A custom packaging quote request. customer is null for guests."""

    class Status(models.TextChoices):
        NEW = 'new', 'New'
        IN_REVIEW = 'in_review', 'In Review'
        QUOTED = 'quoted', 'Quoted'
        CLOSED = 'closed', 'Closed'

    reference = models.CharField(
        max_length=20,
        unique=True,
        default=enquiry_reference,
        editable=False,
        db_index=True,
    )
    customer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enquiries',
    )
    # Contact
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    # Requirement
    product_category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enquiries',
    )
    dimensions = models.CharField(max_length=100, blank=True)
    material_preference = models.CharField(max_length=120, blank=True)
    quantity = models.PositiveIntegerField(null=True, blank=True)
    printing_requirements = models.TextField(blank=True)
    delivery_location = models.CharField(max_length=255, blank=True)
    # Content
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reference} — {self.subject}'


class EnquiryAttachment(TimestampMixin):
    """Logo / reference artwork uploaded with an enquiry."""

    class Kind(models.TextChoices):
        LOGO = 'logo', 'Company Logo'
        REFERENCE = 'reference', 'Reference Design'
        OTHER = 'other', 'Other'

    enquiry = models.ForeignKey(
        Enquiry,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    file = models.FileField(
        upload_to='enquiries/%Y/%m/',
        validators=ATTACHMENT_VALIDATORS,
    )
    kind = models.CharField(
        max_length=20,
        choices=Kind.choices,
        default=Kind.OTHER,
        db_index=True,
    )
    original_name = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.enquiry.reference}: {self.get_kind_display()} — {self.original_name or self.file.name}'
