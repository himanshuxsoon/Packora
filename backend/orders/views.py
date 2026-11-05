import django_filters
from django.db.models import Prefetch
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsAdmin
from suppliers.models import Supplier

from .models import Order, OrderItem, OrderStatusHistory
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderStatusHistorySerializer,
    StatusUpdateSerializer,
)


class OrderFilter(django_filters.FilterSet):
    class Meta:
        model = Order
        fields = {
            'status': ['exact'],
            'created_at': ['gte', 'lte'],
        }


class OrderViewSet(viewsets.ModelViewSet):
    """Customers create orders and track their own.
    Admins see/manage all orders and drive status transitions."""

    filterset_class = OrderFilter
    ordering_fields = ['created_at', 'total']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        qs = Order.objects.select_related('customer').prefetch_related(
            Prefetch('items', queryset=OrderItem.objects.all()),
            'status_history',
        )
        user = self.request.user
        if user.is_authenticated and user.is_admin:
            return qs
        if user.is_authenticated:
            return qs.filter(customer=user)
        return qs.none()

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        if self.action in ('update', 'partial_update', 'update_status', 'assign_supplier'):
            return [IsAdmin()]
        if self.action == 'status_history':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['get'], url_path='status-history')
    def status_history(self, request, pk=None):
        order = self.get_object()
        history = order.status_history.select_related('changed_by')
        return Response(OrderStatusHistorySerializer(history, many=True).data)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = StatusUpdateSerializer(
            data=request.data, context={'order': order},
        )
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        note = serializer.validated_data.get('note', '')
        if new_status == order.status:
            return Response(
                {'detail': 'Status unchanged.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            note=note,
            changed_by=request.user,
        )
        return Response(OrderSerializer(order, context={'request': request}).data)

    @action(detail=True, methods=['post'], url_path='assign-supplier')
    def assign_supplier(self, request, pk=None):
        order = self.get_object()
        supplier_id = request.data.get('supplier')
        if supplier_id in (None, ''):
            order.supplier = None
        else:
            try:
                order.supplier = Supplier.objects.get(pk=supplier_id, is_active=True)
            except Supplier.DoesNotExist:
                return Response(
                    {'supplier': 'Supplier not found.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        order.save(update_fields=['supplier', 'updated_at'])
        return Response(OrderSerializer(order, context={'request': request}).data)
