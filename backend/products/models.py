from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils.text import slugify

from core.models import TimestampMixin

IMAGE_VALIDATORS = [
    FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp']),
]


def product_image_path(instance, filename):
    return f'products/{instance.product.slug}/{filename}'


class Category(TimestampMixin):
    """Packaging category. Self-referencing parent allows sub-categories
    (e.g. Boxes > Rigid Boxes)."""

    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
    )
    description = models.TextField(blank=True)
    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        validators=IMAGE_VALIDATORS,
    )
    is_active = models.BooleanField(default=True, db_index=True)
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['ordering', 'name']
        constraints = [
            models.UniqueConstraint(
                fields=['parent', 'name'],
                name='unique_category_name_per_parent',
            ),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(TimestampMixin):
    """A purchasable/customisable packaging item (box, mailer, label...)."""

    class Unit(models.TextChoices):
        PIECE = 'pc', 'Piece'
        REAM = 'ream', 'Ream'
        KG = 'kg', 'Kilogram'
        METER = 'm', 'Meter'

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
    )
    description = models.TextField(blank=True)
    material = models.CharField(max_length=120, blank=True)
    dimensions = models.CharField(
        max_length=100,
        blank=True,
        help_text='e.g. 10x10x5 cm',
    )
    unit = models.CharField(
        max_length=10,
        choices=Unit.choices,
        default=Unit.PIECE,
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_quantity = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def primary_image(self):
        img = self.images.order_by('ordering', 'id').first()
        return img.image.url if img else None


class ProductImage(TimestampMixin):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(
        upload_to=product_image_path,
        validators=IMAGE_VALIDATORS,
    )
    alt_text = models.CharField(max_length=200, blank=True)
    ordering = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['ordering', 'id']

    def __str__(self):
        return f'{self.product.name} — image {self.id}'
