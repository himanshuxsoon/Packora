from django.contrib import admin

from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'quantity', 'unit_price', 'line_total')


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ('status', 'note', 'changed_by', 'created_at')
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('number', 'customer', 'status', 'supplier', 'total',
                    'created_at')
    list_filter = ('status', 'supplier')
    search_fields = ('number', 'customer__username', 'customer__email')
    readonly_fields = ('number', 'subtotal', 'tax', 'total', 'created_at',
                       'updated_at')
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    date_hierarchy = 'created_at'
