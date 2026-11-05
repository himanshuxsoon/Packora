from rest_framework import serializers

from products.models import Product

from .models import Order, OrderItem, OrderStatusHistory


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name',
            'quantity', 'unit_price', 'line_total',
        ]
        read_only_fields = ['product_name', 'line_total']


class OrderItemWriteSerializer(serializers.ModelSerializer):
    product = serializers.SlugRelatedField(
        slug_field='slug', queryset=Product.objects.filter(is_active=True),
    )

    class Meta:
        model = OrderItem
        fields = ['product', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_username = serializers.CharField(
        source='customer.username', read_only=True,
    )
    supplier_name = serializers.CharField(
        source='supplier.company_name', read_only=True,
    )
    status_history = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'number', 'customer', 'customer_username', 'status',
            'shipping_address', 'shipping_city', 'shipping_state',
            'shipping_postal_code', 'shipping_country', 'notes',
            'supplier', 'supplier_name',
            'subtotal', 'tax', 'total', 'items', 'status_history',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'number', 'customer', 'status', 'supplier', 'subtotal', 'tax',
            'total', 'created_at', 'updated_at',
        ]

    def get_status_history(self, obj):
        return [
            {
                'status': h.status,
                'note': h.note,
                'changed_by': h.changed_by.username if h.changed_by else None,
                'created_at': h.created_at,
            }
            for h in obj.status_history.all()
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """Customer checkout: items priced server-side from the catalogue —
    never trust client-sent prices."""

    items = OrderItemWriteSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'shipping_address', 'shipping_city', 'shipping_state',
            'shipping_postal_code', 'shipping_country', 'notes', 'items',
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('Order must contain items.')
        seen = set()
        for item in items:
            if item['product'].id in seen:
                raise serializers.ValidationError(
                    'Duplicate product in order.'
                )
            seen.add(item['product'].id)
            if item['quantity'] < item['product'].min_order_quantity:
                raise serializers.ValidationError(
                    f"{item['product'].name}: minimum order is "
                    f"{item['product'].min_order_quantity}."
                )
        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(
            customer=self.context['request'].user,
            **validated_data,
        )
        OrderStatusHistory.objects.create(
            order=order,
            status=Order.Status.PENDING,
            note='Order placed',
            changed_by=self.context['request'].user,
        )
        for item in items_data:
            product = item['product']
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=item['quantity'],
                unit_price=product.price,
            )
        order.recalculate_totals()
        return order

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data


class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, value):
        order = self.context['order']
        if order.is_terminal and value != order.status:
            raise serializers.ValidationError(
                'Order is in a terminal state and cannot change status.'
            )
        return value


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(
        source='changed_by.username', read_only=True,
    )

    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'note', 'changed_by_username', 'created_at']
