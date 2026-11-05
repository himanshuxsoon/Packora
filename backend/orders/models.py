import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from accounts.models import User
from core.models import TimestampMixin
from products.models import Product
from suppliers.models import Supplier


def order_number():
    return f'PO-{timezone.now():%Y%m}-{uuid.uuid4().hex[:6].upper()}'


class Order(TimestampMixin):
    """A confirmed purchase. Status transitions are audited in
    OrderStatusHistory — never update status silently."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        PROCESSING = 'processing', 'Processing'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    TERMINAL_STATUSES = {Status.DELIVERED, Status.CANCELLED}

    number = models.CharField(
        max_length=20,
        unique=True,
        default=order_number,
        editable=False,
    )
    customer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='orders',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100, blank=True)
    shipping_postal_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100, default='India')
    notes = models.TextField(blank=True)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders',
    )
    subtotal = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
    )
    tax = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
    )
    total = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.number} — {self.customer.username}'

    @property
    def is_terminal(self):
        return self.status in self.TERMINAL_STATUSES

    def recalculate_totals(self):
        items = self.items.all()
        self.subtotal = sum(i.line_total for i in items)
        self.total = self.subtotal + self.tax
        self.save(update_fields=['subtotal', 'total', 'updated_at'])


class OrderItem(TimestampMixin):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items',
    )
    product_name = models.CharField(
        max_length=200,
        help_text='Snapshot of product name at purchase time',
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['id']

    @property
    def line_total(self):
        return self.quantity * self.unit_price

    def save(self, *args, **kwargs):
        if not self.product_name:
            self.product_name = self.product.name
        super().save(*args, **kwargs)
        self.order.recalculate_totals()

    def delete(self, *args, **kwargs):
        order = self.order
        super().delete(*args, **kwargs)
        order.recalculate_totals()

    def __str__(self):
        return f'{self.product_name} x{self.quantity}'


class OrderStatusHistory(TimestampMixin):
    """Audit trail for order status changes."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    status = models.CharField(max_length=20, choices=Order.Status.choices)
    note = models.TextField(blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+',
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'order status histories'

    def __str__(self):
        return f'{self.order.number}: {self.status}'
