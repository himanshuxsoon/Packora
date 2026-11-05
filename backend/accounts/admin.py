from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import CustomerProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('PACKORA', {'fields': ('role', 'phone')}),
    )


class CustomerProfileInline(admin.StackedInline):
    model = CustomerProfile
    can_delete = False
    verbose_name_plural = 'customer profile'
    fields = ('company_name', 'address', 'city', 'state',
              'postal_code', 'country', 'gst_number')


# CustomerProfile registered standalone too (for non-customer users' edge cases)
admin.site.register(CustomerProfile)
