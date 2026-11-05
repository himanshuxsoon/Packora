from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models

from core.models import TimestampMixin


class PackoraUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra):
        extra.setdefault('role', 'admin')
        return super().create_superuser(username, email, password, **extra)


class User(AbstractUser, TimestampMixin):
    """Custom user. Django's auth.User is swapped for this via AUTH_USER_MODEL.

    role drives permissions: admins manage everything, customers place orders,
    suppliers fulfil raw-material requests.
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        CUSTOMER = 'customer', 'Customer'
        SUPPLIER = 'supplier', 'Supplier'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        db_index=True,
    )
    phone = models.CharField(max_length=15, blank=True)

    objects = PackoraUserManager()

    class Meta:
        ordering = ['-date_joined']
        verbose_name = 'user'
        verbose_name_plural = 'users'

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_staff

    def __str__(self):
        return f'{self.username} ({self.get_role_display()})'


class CustomerProfile(TimestampMixin):
    """One-to-one extension of User for business/customer details.

    Kept separate from User so auth stays lean and supplier/admin users
    don't carry customer-only fields.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='customer_profile',
    )
    company_name = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    gst_number = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = 'customer profile'
        verbose_name_plural = 'customer profiles'

    def __str__(self):
        name = self.user.get_full_name() or self.user.username
        return f'{name} — {self.company_name or "no company"}'
