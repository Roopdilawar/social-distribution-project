from django.contrib.auth import authenticate
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import User,Post ,Comments,Followers,Inbox
from rest_framework import generics
from rest_framework.generics import UpdateAPIView, DestroyAPIView
from django.shortcuts import get_object_or_404
from rest_framework.generics import CreateAPIView
from .serializers import RegisterSerializer, AuthorSerializer,PostSerializer,CommentSerializer,FollowerSerializer,InboxSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView
from django.db.models import Count
import base64
from django.shortcuts import render
from django.conf import settings
import os
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import JSONParser


def index(request):
    try:
        with open(os.path.join(settings.REACT_APP_DIR, 'build', 'index.html')) as file:
            return HttpResponse(file.read())
    except:
        return HttpResponse(
            """
            index.html not found! Build React app and try again.
            """,
            status=501,
        )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # print("Received data:", request.data)  # Debug: Print received data
        username = request.data.get('username')  # Or change 'username' to the correct key
        # print("Username:", username)
        return super(RegisterView, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(user.password)
        user.save()
        

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
        # print(user)
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



class PostsView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    
    def perform_create(self, serializer):
        if self.request.user.is_anonymous:
            temp_user = User.objects.get(id=1)
            serializer.save(author=temp_user)
        else:
            serializer.save(author=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        response = super(PostsView, self).list(request, *args, **kwargs)
        response.data = {
            "type": "posts",
            "items": response.data
        }
        # print(response.data)
        return response


class GetImageView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, post_id, format=None):
        post = get_object_or_404(Post, id=post_id)

        if not post.content_type=="image/base64":
            return Response(status=404)

        try:
            format, imgstr = post.content.split(';base64,') 
            ext = format.split('/')[-1] 
            data = base64.b64decode(imgstr)

            return HttpResponse(data, content_type=f'image/{ext}')
        except (ValueError, base64.binascii.Error):
            return Response(status=404)
    
    
class DetailPostView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    # permission_classes = [IsAuthenticated]

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['post_id'])
        return obj

    def put(self, request, *args, **kwargs):
        # print("i am in put")
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



class AddCommentView(generics.CreateAPIView):
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer

    def perform_create(self, serializer):
        
        post = Post.objects.get(id=self.kwargs['post_id'])
        if self.request.user.is_anonymous:
            temp_user = User.objects.get(id=1)
            serializer.save(author=temp_user, post=post)
        else:
            serializer.save(author=self.request.user, post=post)
        
        
        
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # print("nothing,",serializer.instance.post)
        post_instance = serializer.instance.post
        post_instance.update_comments_count()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        
        
        
        
               
        
class ListCommentsView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        post_comments = Comments.objects.filter(post_id=post_id)
        return post_comments

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = {
            "type": "comments",
            "items": serializer.data
        }
        return Response(data)
    
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer
    # permission_classes = [IsAuthenticated]

    def get_object(self):
        queryset = self.get_queryset()
        # print(self.kwargs)
        obj = get_object_or_404(queryset, pk=self.kwargs['comment_id'])
        return obj

    def put(self, request, *args, **kwargs):
        # print("i am in put")
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        response = super(CommentDetailView, self).retrieve(request, *args, **kwargs)
        return response

    def update(self, request, *args, **kwargs):
        response = super(CommentDetailView, self).update(request, *args, **kwargs)
        return response

    def destroy(self, request, *args, **kwargs):
        response = super(CommentDetailView, self).destroy(request, *args, **kwargs)
        return response

    

class LikePostView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        
        if self.request.user.is_anonymous:
            temp_user = User.objects.get(id=1)
            try:
                post = Post.objects.get(id=post_id)
                if temp_user in post.liked_by.all():
                    post.liked_by.remove(temp_user)
                else:
                    post.liked_by.add(temp_user)
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Post.DoesNotExist:
                return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
            
            
        else:
            try:
                post = Post.objects.get(id=post_id)
                if request.user not in post.liked_by.all():
                    post.liked_by.add(request.user)
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Post.DoesNotExist:
                return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)


class GetUserIDView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user_id = request.user.id
        return Response({'user_id': user_id})

class UserBioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user_bio = request.user.bio
        return Response({'user_bio': user_bio})
    
    def put(self, request, format=None):
        """
        Update the bio of the authenticated user.
        """
        user = request.user
        data = JSONParser().parse(request)
        bio = data.get('bio', None)

        if bio is not None:
            user.bio = bio
            user.save()
            return Response({'message': 'Bio updated successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Bio is required'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfilePictureView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user_profile_picture = request.user.profile_picture
        return Response({'user_profile_picture': user_profile_picture})
    
    def put(self, request, format=None):
        """
        Update the bio of the authenticated user.
        """
        user = request.user
        data = JSONParser().parse(request)
        profile_picture = data.get('profile_picture', None)

        if profile_picture is not None:
            user.profile_picture = profile_picture
            user.save()
            return Response({'message': 'Profile picture updated successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Profile picture is required'}, status=status.HTTP_400_BAD_REQUEST)
    
        


from django.http import JsonResponse

class AddFollowerView(generics.CreateAPIView):
    queryset = Followers.objects.all()
    serializer_class = FollowerSerializer

    def perform_create(self, serializer):
        foreign_author= self.kwargs.get('author_id')
        author_to_follow = get_object_or_404(User, id=foreign_author)
        
        # Determine the current user
        current_user = self.request.user if not self.request.user.is_anonymous else get_object_or_404(User, id=3)
        
        print("current user",current_user)
        print("author to follow",author_to_follow)
        
        # import pdb
        # pdb.set_trace()
        # Check for self-following
        if current_user == author_to_follow:
            raise ValidationError("You can't follow yourself.")

        # Check for existing following relationship
        elif Followers.are_friends(current_user, author_to_follow):
            print("already following")
            raise ValidationError("You're friends.")
        
        elif Followers.objects.filter(author_to_follow=current_user, author=author_to_follow).exists() :
            print(author_to_follow)
            print(current_user)
            raise ValidationError("You're already following this author.")
        
        
        serializer.save(author=author_to_follow, author_to_follow=current_user)

    def create(self, request, *args, **kwargs):
        # Call the parent class's create method, which handles serialization, validation, and object creation
        return super().create(request, *args, **kwargs)
        
        
        
        
        
               
        
class ListFollowersView(generics.ListAPIView):
    serializer_class = FollowerSerializer

    def get_queryset(self):
        author_id = self.kwargs['author_id']
        author_followers = Followers.objects.filter(author_id=author_id)
        return author_followers

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = {
            "type": "followers",
            "items": serializer.data
        }
        return Response(data)



class DetailFollower(generics.RetrieveUpdateDestroyAPIView):
    queryset = Followers.objects.all()
    serializer_class = FollowerSerializer
    # permission_classes = [IsAuthenticated]

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['follower_id'])
        return obj

    def put(self, request, *args, **kwargs):
        # print("i am in put")
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        response = super(DetailFollower, self).retrieve(request, *args, **kwargs)
        return response

    def update(self, request, *args, **kwargs):
        response = super(DetailFollower, self).update(request, *args, **kwargs)
        return response

    def destroy(self, request, *args, **kwargs):
        response = super(DetailFollower, self).destroy(request, *args, **kwargs)
        return response
    
    
class InboxViewSet(viewsets.ViewSet):
    """
    A viewset for viewing and editing inbox items.
    """
    
    def get_queryset(self, author_id):
        """
        Helper function to get the combined queryset for posts, comments, and follow requests
        """
        followers=Followers.objects.filter(author_to_follow__id=author_id).select_related('author_to_follow')
        followers=[]
        posts = Post.objects.filter(author__id=author_id).select_related('author')
        comments = Comments.objects.filter(post__author__id=author_id).select_related('author', 'post')
        
        # follow_requests = FollowRequest.objects.filter(author__id=author_id).select_related('author')

       
        combined = list(posts) + list(comments) 
        # + list(follow_requests)

       
        # combined.sort(key=lambda x: x.created, reverse=True)
        return combined

    def list(self, request, author_id=None):
        """
        List all items in the inbox for a given author
        """
        combined_queryset = self.get_queryset(author_id)

        
        serialized_data = []
        for item in combined_queryset:
            if isinstance(item, Post):
                serialized_data.append(PostSerializer(item).data)
            elif isinstance(item, Comments):
                serialized_data.append(CommentSerializer(item).data)
            elif isinstance(item, FollowRequest):
                serialized_data.append(FollowRequestSerializer(item).data)
        
        return Response(serialized_data)

    def create(self, request):
        
        item_type = request.data.get('type')
        if item_type == 'post':
            serializer = PostSerializer(data=request.data)
        elif item_type == 'comment':
            serializer = CommentSerializer(data=request.data)
        elif item_type == 'follow':
            serializer = FollowRequestSerializer(data=request.data)
       

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   






