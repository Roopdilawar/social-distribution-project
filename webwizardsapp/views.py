from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import User,Post ,UserFollowing,Comments
from rest_framework import generics
from rest_framework.generics import UpdateAPIView, DestroyAPIView
from django.shortcuts import get_object_or_404
from rest_framework.generics import CreateAPIView
from .serializers import RegisterSerializer, AuthorSerializer,PostSerializer,UserFollowingSerializer,CommentSerializer
from rest_framework.permissions import IsAuthenticated


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        print("Received data:", request.data)  # Debug: Print received data
        username = request.data.get('username')  # Or change 'username' to the correct key
        print("Username:", username)
        return super(RegisterView, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(user.password)
        user.save()
        Author.objects.create(user=user)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("failed")
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
    


class AuthorsListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = AuthorSerializer

    def list(self, request, *args, **kwargs):
        response = super(AuthorsListView, self).list(request, *args, **kwargs)
        response.data = {
            "type": "authors",
            "items": response.data
        }
        return response
    
    
class AuthorDetailView(generics.RetrieveAPIView,UpdateAPIView,DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AuthorSerializer
    def retrieve(self, request, *args, **kwargs):
        response = super(AuthorDetailView, self).retrieve(request, *args, **kwargs)
        
        return response



class FollowUserView(CreateAPIView):
    serializer_class = UserFollowingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
        
class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, following_user_id):
        try:
            following_relationship = UserFollowing.objects.get(user=request.user, following_user_id=following_user_id)
            following_relationship.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserFollowing.DoesNotExist:
            return Response({'error': 'Not following this user.'}, status=status.HTTP_400_BAD_REQUEST)




class PostsView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def list(self, request, *args, **kwargs):
        response = super(PostsView, self).list(request, *args, **kwargs)
        response.data = {
            "type": "posts",
            "items": response.data
        }
        return response
    
    
class DetailPostView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    # permission_classes = [IsAuthenticated]

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['post_id'])
        return obj

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        response = super(DetailPostView, self).retrieve(request, *args, **kwargs)
        return response

    def update(self, request, *args, **kwargs):
        response = super(DetailPostView, self).update(request, *args, **kwargs)
        return response

    def destroy(self, request, *args, **kwargs):
        response = super(DetailPostView, self).destroy(request, *args, **kwargs)
        return response



class AddCommentView(CreateAPIView):
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer
    

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)



class LikePostView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
            if request.user in post.liked_by.all():
                post.liked_by.remove(request.user)
            else:
                post.liked_by.add(request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)















