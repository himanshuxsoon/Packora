from rest_framework import serializers

from .models import Quotation, QuotationItem


class QuotationItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True,
    )

    class Meta:
        model = QuotationItem
        fields = [
            'id', 'description', 'quantity', 'unit',
            'unit_price', 'line_total',
        ]
        read_only_fields = ['line_total']


class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    customer_username = serializers.CharField(
        source='customer.username', read_only=True,
    )

    class Meta:
        model = Quotation
        fields = [
            'id', 'number', 'customer', 'customer_username', 'enquiry',
            'status', 'valid_until', 'notes', 'total',
            'items', 'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['number', 'total', 'created_by',
                            'created_at', 'updated_at']


class QuotationItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = ['description', 'quantity', 'unit', 'unit_price']


class QuotationWriteSerializer(serializers.ModelSerializer):
    """Admin creates a quotation with line items in one request."""

    items = QuotationItemWriteSerializer(many=True)

    class Meta:
        model = Quotation
        fields = [
            'customer', 'enquiry', 'status', 'valid_until',
            'notes', 'items',
        ]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('At least one item is required.')
        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        quotation = Quotation.objects.create(
            created_by=self.context['request'].user,
            **validated_data,
        )
        for item in items_data:
            QuotationItem.objects.create(quotation=quotation, **item)
        quotation.recalculate_total()
        return quotation

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                QuotationItem.objects.create(quotation=instance, **item)
            instance.recalculate_total()
        return instance

    def to_representation(self, instance):
        return QuotationSerializer(instance, context=self.context).data
