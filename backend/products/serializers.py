from rest_framework import serializers

from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'parent', 'description',
            'image', 'is_active', 'ordering', 'children', 'product_count',
        ]
        read_only_fields = ['slug', 'product_count']

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategorySerializer(
            children, many=True, context=self.context
        ).data


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'ordering']
        read_only_fields = ['image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name',
            'description', 'material', 'dimensions', 'unit',
            'price', 'min_order_quantity', 'is_active', 'is_featured',
            'images', 'created_at', 'updated_at',
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""

    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name',
            'material', 'dimensions', 'unit', 'price',
            'min_order_quantity', 'is_featured', 'image_url',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        img = obj.images.order_by('ordering', 'id').first()
        if img and img.image:
            url = img.image.url
            return request.build_absolute_uri(url) if request else url
        return None
