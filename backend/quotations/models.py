import uuid

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from accounts.models import User
from core.models import TimestampMixin
from enquiries.models import Enquiry


def quotation_number():
    return f'Q-{timezone.now():%Y%m}-{uuid.uuid4().hex[:6].upper()}'


class Quotation(TimestampMixin):
    """A priced offer sent to a customer, usually in response to an Enquiry."""

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SENT = 'sent', 'Sent'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'
        EXPIRED = 'expired', 'Expired'

    number = models.CharField(
        max_length=20,
        unique=True,
        default=quotation_number,
        editable=False,
    )
    customer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='quotations',
    )
    enquiry = models.ForeignKey(
        Enquiry,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotations',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    valid_until = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.number} — {self.customer.username}'

    def recalculate_total(self):
        self.total = sum(item.line_total for item in self.items.all())
        self.save(update_fields=['total', 'updated_at'])


class QuotationItem(TimestampMixin):
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        related_name='items',
    )
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )
    unit = models.CharField(max_length=20, default='pc')
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    class Meta:
        ordering = ['id']

    @property
    def line_total(self):
        return self.quantity * self.unit_price

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.quotation.recalculate_total()

    def delete(self, *args, **kwargs):
        quotation = self.quotation
        super().delete(*args, **kwargs)
        quotation.recalculate_total()

    def __str__(self):
        return f'{self.description} x{self.quantity}'
