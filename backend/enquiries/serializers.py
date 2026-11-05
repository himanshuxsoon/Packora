from django.core.files.uploadedfile import UploadedFile
from rest_framework import serializers

from .models import MAX_UPLOAD_SIZE, Enquiry, EnquiryAttachment

ALLOWED_EXTS = ('jpg', 'jpeg', 'png', 'webp', 'pdf')


def validate_upload(file: UploadedFile, field_name='file'):
    ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
    if ext not in ALLOWED_EXTS:
        raise serializers.ValidationError(
            f'{field_name}: only JPG, PNG, WebP or PDF allowed.'
        )
    if file.size > MAX_UPLOAD_SIZE:
        raise serializers.ValidationError(
            f'{field_name}: file must be under 10MB.'
        )
    return file


class EnquiryAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = EnquiryAttachment
        fields = ['id', 'file', 'file_url', 'kind', 'original_name', 'created_at']
        read_only_fields = ['file_url', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None


class EnquirySerializer(serializers.ModelSerializer):
    attachments = EnquiryAttachmentSerializer(many=True, read_only=True)
    category_name = serializers.CharField(
        source='product_category.name', read_only=True,
    )

    class Meta:
        model = Enquiry
        fields = [
            'id', 'reference', 'name', 'email', 'phone', 'company_name',
            'product_category', 'category_name', 'dimensions',
            'material_preference', 'quantity', 'printing_requirements',
            'delivery_location', 'subject', 'message', 'status',
            'attachments', 'created_at', 'updated_at',
        ]
        read_only_fields = ['reference', 'created_at', 'updated_at']


class EnquiryCreateSerializer(serializers.ModelSerializer):
    """Public intake — guests allowed. Multipart form-data.
    Dedicated logo/reference fields plus an optional extra-files list."""

    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False,
    )
    logo = serializers.FileField(write_only=True, required=False)
    reference_design = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = Enquiry
        fields = [
            'name', 'email', 'phone', 'company_name',
            'product_category', 'dimensions', 'material_preference',
            'quantity', 'printing_requirements', 'delivery_location',
            'subject', 'message', 'files', 'logo', 'reference_design',
        ]

    def validate_files(self, files):
        for f in files:
            validate_upload(f, f.name)
        return files

    def validate_logo(self, f):
        return validate_upload(f, 'Company logo')

    def validate_reference_design(self, f):
        return validate_upload(f, 'Reference design')

    def create(self, validated_data):
        files = validated_data.pop('files', [])
        logo = validated_data.pop('logo', None)
        reference = validated_data.pop('reference_design', None)
        request = self.context['request']
        user = request.user if request.user.is_authenticated else None
        enquiry = Enquiry.objects.create(customer=user, **validated_data)

        if logo:
            EnquiryAttachment.objects.create(
                enquiry=enquiry, file=logo,
                kind=EnquiryAttachment.Kind.LOGO,
                original_name=logo.name,
            )
        if reference:
            EnquiryAttachment.objects.create(
                enquiry=enquiry, file=reference,
                kind=EnquiryAttachment.Kind.REFERENCE,
                original_name=reference.name,
            )
        for f in files:
            EnquiryAttachment.objects.create(
                enquiry=enquiry, file=f,
                kind=EnquiryAttachment.Kind.OTHER,
                original_name=f.name,
            )
        return enquiry

    def to_representation(self, instance):
        return EnquirySerializer(instance, context=self.context).data
