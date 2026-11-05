from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EnquiryViewSet

router = DefaultRouter()
router.register('enquiries', EnquiryViewSet, basename='enquiry')

urlpatterns = [path('', include(router.urls))]
