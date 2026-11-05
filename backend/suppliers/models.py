from django.core.validators import EmailValidator
from django.db import models

from core.models import TimestampMixin


class Supplier(TimestampMixin):
    """A vendor PACKORA buys raw materials / finished goods from.

    Admin-only visibility — customers must never see supplier pricing.
    """

    company_name = models.CharField(max_length=255, unique=True)
    contact_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(validators=[EmailValidator()])
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    supplies = models.CharField(
        max_length=255,
        blank=True,
        help_text='e.g. corrugated sheets, inks, labels',
    )
    # ADMIN-ONLY commercial data — never expose via customer-facing APIs
    lead_time_days = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Estimated production + delivery lead time',
    )
    cost_notes = models.TextField(
        blank=True,
        help_text='Manufacturing costs, margins, negotiated rates',
    )
    is_active = models.BooleanField(default=True, db_index=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['company_name']
        verbose_name_plural = 'suppliers'

    def __str__(self):
        return self.company_name
