from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import ServerCredentials
import base64

class ServerBasicAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', None)
        if not auth_header or not auth_header.startswith('Basic '):
            return None

        auth_decoded = base64.b64decode(auth_header.split(' ')[1]).decode('utf-8')
        username, password = auth_decoded.split(':', 1)

        try:
            server_cred = ServerCredentials.objects.get(incoming_username=username, incoming_password=password)
            return (None, server_cred)
        except ServerCredentials.DoesNotExist:
            raise AuthenticationFailed('No such server credentials or incorrect password')
