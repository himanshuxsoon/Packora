from django.db.models import Count, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAdmin
from enquiries.models import Enquiry
from orders.models import Order
from products.models import Product
from quotations.models import Quotation
from suppliers.models import Supplier


class DashboardStatsView(APIView):
    """GET /api/dashboard/stats/ — admin-only business overview."""

    permission_classes = [IsAdmin]

    def get(self, request):
        orders_qs = Order.objects.all()
        return Response({
            'orders': {
                'total': orders_qs.count(),
                'by_status': dict(
                    orders_qs.values_list('status').annotate(c=Count('id'))
                ),
                'revenue': str(
                    orders_qs.exclude(status=Order.Status.CANCELLED)
                    .aggregate(t=Sum('total'))['t'] or 0
                ),
            },
            'enquiries': {
                'total': Enquiry.objects.count(),
                'new': Enquiry.objects.filter(status=Enquiry.Status.NEW).count(),
            },
            'quotations': {
                'total': Quotation.objects.count(),
                'by_status': dict(
                    Quotation.objects.values_list('status')
                    .annotate(c=Count('id'))
                ),
            },
            'products': {
                'total': Product.objects.count(),
                'active': Product.objects.filter(is_active=True).count(),
            },
            'suppliers': {
                'total': Supplier.objects.count(),
                'active': Supplier.objects.filter(is_active=True).count(),
            },
            'customers': Order.objects.values('customer').distinct().count(),
        })
