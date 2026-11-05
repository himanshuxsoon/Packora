from django.contrib import admin

from .models import Quotation, QuotationItem


class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 1


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ('number', 'customer', 'status', 'total', 'valid_until',
                    'created_at')
    list_filter = ('status',)
    search_fields = ('number', 'customer__username', 'customer__email')
    readonly_fields = ('number', 'total', 'created_at', 'updated_at')
    inlines = [QuotationItemInline]
    date_hierarchy = 'created_at'
