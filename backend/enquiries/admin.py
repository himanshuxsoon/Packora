from django.contrib import admin

from .models import Enquiry, EnquiryAttachment


class EnquiryAttachmentInline(admin.TabularInline):
    model = EnquiryAttachment
    extra = 0
    readonly_fields = ('file_url_display',)

    @admin.display(description='File')
    def file_url_display(self, obj):
        return obj.file.url if obj.file else '—'


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ('reference', 'name', 'email', 'subject', 'status',
                    'quantity', 'created_at')
    list_filter = ('status', 'product_category')
    search_fields = ('reference', 'name', 'email', 'subject', 'company_name')
    readonly_fields = ('reference', 'created_at', 'updated_at')
    inlines = [EnquiryAttachmentInline]
    date_hierarchy = 'created_at'
