from django.urls import path
from .views import LoginAPIView, RegisterView

urlpatterns = [
    path('api/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/signup/', RegisterView.as_view(), name='signup')
]
