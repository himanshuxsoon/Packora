import django_filters
from django.db.models import Count, Prefetch
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from core.permissions import IsAdmin

from .models import Category, Product, ProductImage
from .serializers import (
    CategorySerializer,
    ProductImageSerializer,
    ProductListSerializer,
    ProductSerializer,
)


class CategoryFilter(django_filters.FilterSet):
    class Meta:
        model = Category
        fields = {
            'is_active': ['exact'],
            'parent': ['exact', 'isnull'],
        }


class CategoryViewSet(viewsets.ModelViewSet):
    """GET is public (active categories). Writes are admin-only."""

    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Category.objects.annotate(product_count=Count('products'))
        if self.action == 'list' and not self.request.user.is_staff:
            qs = qs.filter(is_active=True, parent__isnull=True)
        return qs.select_related('parent').prefetch_related('children')

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return super().get_permissions()


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category__slug')
    category_id = django_filters.NumberFilter(field_name='category_id')
    min_price = django_filters.NumberFilter(
        field_name='price', lookup_expr='gte',
    )
    max_price = django_filters.NumberFilter(
        field_name='price', lookup_expr='lte',
    )

    class Meta:
        model = Product
        fields = ['is_active', 'is_featured', 'category', 'category_id']


class ProductViewSet(viewsets.ModelViewSet):
    """Public catalogue: list/retrieve active products; admin manages all."""

    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'material']
    ordering_fields = ['price', 'name', 'created_at']
    ordering = ['name']
    lookup_field = 'slug'

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related(
            Prefetch(
                'images',
                queryset=ProductImage.objects.order_by('ordering', 'id'),
            ),
        )
        if self.action in ('list', 'retrieve') and not (
            self.request.user.is_authenticated
            and self.request.user.is_admin
        ):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy', 'upload_image'):
            return [IsAdmin()]
        return super().get_permissions()

    @action(
        detail=True, methods=['post'], url_path='images',
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_image(self, request, slug=None):
        product = self.get_object()
        serializer = ProductImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
