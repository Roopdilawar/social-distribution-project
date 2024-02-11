from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import RegisterSerializer, AuthorSerializer


class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"user": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        print(username, password)
        user = authenticate(username=username, password=password)
        print(user)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_400_BAD_REQUEST)
    
class AuthorsListView(APIView):
    def get(self, request, format=None):
        authors = User.objects.all()
        serializer = AuthorSerializer(authors, many=True, context={'request': request})
        return Response({
            'type': 'authors',
            'items': serializer.data
        })

class AuthorDetailView(APIView):
    def get(self, request, pk, format=None):
        try:
            author = User.objects.get(username=pk)
            serializer = AuthorSerializer(author, context={'request': request})
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, pk, format=None):
        try:
            author = User.objects.get(username=pk)
            serializer = AuthorSerializer(author, data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

