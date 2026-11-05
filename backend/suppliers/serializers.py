from rest_framework import serializers

from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            'id', 'company_name', 'contact_name', 'email', 'phone',
            'address', 'city', 'state', 'country', 'supplies',
            'lead_time_days', 'cost_notes',
            'is_active', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
