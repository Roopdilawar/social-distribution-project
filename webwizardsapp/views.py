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
from rest_framework.pagination import PageNumberPagination
from django.http import JsonResponse


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
        user.is_approved = False
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
            if user.is_approved:
                token, created = Token.objects.get_or_create(user=user)
                return Response({"token": token.key}, status=status.HTTP_200_OK)
            else:
                print("User not approved.")
                return Response({"error": "user not approved by the admin"}, status = status.HTTP_403_FORBIDDEN)
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
    queryset = Post.objects.filter(visibility='Public')
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


class AuthorPostsView(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        # Always exclude private posts in the queryset
        author_id = self.kwargs['author_id']
        # Only show public posts
        return Post.objects.filter(author_id=author_id, visibility='Public')

    def perform_create(self, serializer):
        author_id = self.kwargs['author_id']
        author = User.objects.get(id=author_id)
        post = serializer.save(author=author)  # Save to get a post instance with an ID
        
        if post.visibility == 'PRIVATE':
            # For private posts, send the post data to the inboxes of the author's followers
            followers = Followers.objects.filter(author=author).values_list('author_to_follow', flat=True)
            for follower_id in followers:
                follower_user = User.objects.get(id=follower_id)
                inbox, _ = Inbox.objects.get_or_create(user=follower_user)
                
                # Serialize the post for adding to the inbox
                post_data = PostSerializer(post).data
                # Assuming 'content' can store serialized data
                if not hasattr(inbox, 'content'):
                    inbox.content = []
                inbox.content.append(post_data)
                inbox.save()


            

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
        post_id = self.kwargs['post_id']
        post = Post.objects.get(id=post_id)
        post_author = post.author
        inbox, _ = Inbox.objects.get_or_create(user=post_author)
        
        author = self.request.user if not self.request.user.is_anonymous else User.objects.get(id=9)

       
        comment_type = serializer.validated_data.get('type', 'Comment') 
        comment_content = serializer.validated_data.get('content')  
        print(comment_content)

        comment_data = {
            "type": comment_type,
            "summary": f'{author.username} commented on your post',
            "comment": comment_content,  
        }
        
        
        inbox.content.append(comment_data)
        inbox.save()

       
        serializer.save(author=author, post=post)
        
        
        
        
        
               
        
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
            
            
            temp_user = User.objects.get(id=9)
            
            try:
                post = Post.objects.get(id=post_id)
                post_author=post.author
                inbox, _ = Inbox.objects.get_or_create(user=post_author)
                if temp_user in post.liked_by.all():
                    post.liked_by.remove(temp_user)
                else:
                    post.liked_by.add(temp_user)
                    liked_by_data={
                        "type": "Like",
                        "summary": f'{temp_user.username} liked your post',
                        "actor": AuthorSerializer(temp_user).data,
                        "object": PostSerializer(post).data
                    }
                    inbox.content.append(liked_by_data)
                    inbox.save()
                    
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Post.DoesNotExist:
                return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
            
            
        else:
            try:
                post = Post.objects.get(id=post_id)
                post_author=post.author
                inbox, _ = Inbox.objects.get_or_create(user=post_author)
                if request.user not in post.liked_by.all():
                    post.liked_by.add(request.user)
                    liked_by_data={
                        "type": "Like",
                        "summary": f'{request.user.username} liked your post',
                        "actor": AuthorSerializer(request.user).data,
                        "object": PostSerializer(post).data
                    }
                    inbox.content.append(liked_by_data)
                    inbox.save()
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
    
    




class FriendRequestView(APIView):
    def post(self, request, author_id, *args, **kwargs):
        friend = get_object_or_404(User, id=author_id)
        user = request.user if not request.user.is_anonymous else get_object_or_404(User, id=10)
        inbox, _ = Inbox.objects.get_or_create(user=friend)
        if user==friend:
            return Response({"error": "You can't follow yourself."}, status=status.HTTP_400_BAD_REQUEST)
        elif Followers.are_friends(user, friend):
            return Response({"error": "You're friends."}, status=status.HTTP_400_BAD_REQUEST)
        elif Followers.objects.filter(author_to_follow=user, author=friend).exists():
            return Response({"error": "You're already following this author."}, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            user_serializer = AuthorSerializer(user)
            friend_serializer = AuthorSerializer(friend)
            friend_request_data = {
                "type": "Follow",
                "summary": f'{user.username} wants to follow {friend.username}',
                "actor": user_serializer.data,
                "object": friend_serializer.data,
            }
            inbox.content.append(friend_request_data)
            inbox.save()
            return Response({"message": "Friend request sent successfully."}, status=status.HTTP_201_CREATED)





    



class InboxView(APIView):
    def get(self, request, author_id, *args, **kwargs):
        friend = get_object_or_404(User, id=author_id)
        inbox, _ = Inbox.objects.get_or_create(user=friend)
        serializer = InboxSerializer(inbox)
        return Response(serializer.data, status=status.HTTP_200_OK)

    

    

class AcceptFollowRequest(APIView):
    def post(self, request, author_id, *args, **kwargs):
        friend = get_object_or_404(User, id=author_id)
        inbox, _ = Inbox.objects.get_or_create(user=friend)

        data = request.data
        actor_id = int(data['actor']['id'].split('/')[-1])
        object_id = int(data['object']['id'].split('/')[-1])

        if actor_id == object_id:
            return Response({"error": "You can't follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        current_user = get_object_or_404(User, id=actor_id)
        author_to_follow = get_object_or_404(User, id=object_id)

        if Followers.are_friends(current_user, author_to_follow):
            return Response({"error": "You're friends."}, status=status.HTTP_400_BAD_REQUEST)

        if Followers.objects.filter(author_to_follow=current_user, author=author_to_follow).exists():
            return Response({"error": "You're already following this author."}, status=status.HTTP_400_BAD_REQUEST)

        try:
           
            Followers.objects.create(author=author_to_follow, author_to_follow=current_user)
           
            return Response({"success": "Follow request accepted."}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
        
        
        
    
    
    
