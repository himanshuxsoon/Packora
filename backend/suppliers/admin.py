from django.contrib import admin

from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'contact_name', 'email', 'city',
                    'lead_time_days', 'is_active')
    list_filter = ('is_active', 'country')
    search_fields = ('company_name', 'contact_name', 'email', 'supplies')
