from django.contrib.auth import authenticate
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import User,Post,Comments,FollowerList,Inbox,LikedItem,Nodes
from rest_framework import generics
from rest_framework.generics import UpdateAPIView, DestroyAPIView
from django.shortcuts import get_object_or_404
from rest_framework.generics import CreateAPIView
from .serializers import RegisterSerializer,AuthorSerializer,PostSerializer,CommentSerializer,InboxSerializer,LikedItemSerializer, NodesSerializer
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
import requests
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


class PublicPostsView(generics.ListAPIView):
    queryset = Post.objects.filter(visibility='PUBLIC')
    serializer_class = PostSerializer


class AuthorPostsView(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        author_id = self.kwargs['author_id']
        return Post.objects.filter(author_id=author_id)

    def perform_create(self, serializer):
        author_id = self.kwargs['author_id']
        author = User.objects.get(id=author_id)
        post = serializer.save(author=author)
        
        if post.visibility == 'FRIENDS':
            try:
                follower_list_instance = FollowerList.objects.get(user=author)
            except FollowerList.DoesNotExist:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            post_data = PostSerializer(post).data  
            for follower_info in follower_list_instance.followers:
                base_url, author_segment = follower_info['id'].rsplit('/authors/', 1)
                inbox_url = f"{base_url}/api/authors/{author_segment}/inbox/"
                
                try:
                    response = requests.post(inbox_url, json=post_data, headers={"Content-Type": "application/json"})
                    if response.status_code not in (200, 201):
                        print(f"Failed to post to {inbox_url}. Status code: {response.status_code}")
                except requests.exceptions.RequestException as e:
                    print(f"Request to {inbox_url} failed: {e}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)


            

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
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        response = super(DetailPostView, self).retrieve(request, *args, **kwargs)
        return response

    def update(self, request, *args, **kwargs):
        response = super(DetailPostView, self).update(request, *args, **kwargs)
        post_data = self.get_object()
        if response.status_code in (200, 201):
            self.update_or_delete_inboxes(post_data, method='PUT')
        return response

    def destroy(self, request, *args, **kwargs):
        post_data = self.get_object()
        response = super(DetailPostView, self).destroy(request, *args, **kwargs)
        if response.status_code == 204:
            self.update_or_delete_inboxes(post_data, method='DELETE')
        return response
    
    def update_or_delete_inboxes(self, post_data, method):
        author = post_data.author
        post_data = PostSerializer(post_data).data
        try:
            follower_list_instance = FollowerList.objects.get(user=author)
        except FollowerList.DoesNotExist:
            return JsonResponse({'message': 'No followers found.'}, status=200)
        
        for follower_info in follower_list_instance.followers:
            base_url, author_segment = follower_info['id'].rsplit('/authors/', 1)
            inbox_url = f"{base_url}/api/authors/{author_segment}/inbox/"
            
            headers = {"Content-Type": "application/json"}
            try:
                if method == 'PUT':
                    response = requests.put(inbox_url, json=post_data, headers=headers)
                elif method == 'DELETE':
                    response = requests.delete(inbox_url, json=post_data, headers=headers)
                
                if response.status_code not in (200, 201, 204):
                    print(f"Failed to {method} to {inbox_url}. Status code: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"Request to {inbox_url} failed: {e}")



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

    def post(self, request, *args, **kwargs):
        author_data = request.data.get('actor')
        post_data = request.data.get('object')

        if not author_data or not post_data:
            return Response({"error": "Author and Post data are required."}, status=status.HTTP_400_BAD_REQUEST)

        post_id = post_data['id'].split('/')[-1]

        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the author has already liked this post
        if any(author['id'] == author_data['id'] for author in post.liked_by):
            return Response({"message": "You have already liked this post."}, status=status.HTTP_409_CONFLICT)

        # Append the new like to the liked_by field
        post.liked_by.append(author_data)
        post.likes += 1
        post.save()

        # Send like notification to the author's inbox
        author_id_url = post_data['author']['id']
        parts = author_id_url.split('/')
        parts.insert(3, 'api')
        author_inbox_url = '/'.join(parts) + '/inbox/'
        liked_by_message = {
            "summary": f"{author_data['displayName']} Likes your post",
            "type": "Like",
            "author": author_data,
            "object": post_data['id']
        }

        try:
            response = requests.post(author_inbox_url, json=liked_by_message, headers={"Content-Type": "application/json"})
            if response.status_code in [200, 201]:
                return Response({"message": "Like notification sent successfully."}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Failed to send like notification to the author's inbox.", "status_code": response.status_code}, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Like successfully recorded."}, status=status.HTTP_204_NO_CONTENT)



class LikedItemsView(APIView):

    def get(self, request, *args, **kwargs):
        user = request.user if not request.user.is_anonymous else get_object_or_404(User, id=9)
        try:
            liked_items_instance = LikedItem.objects.get(user=user)
        except LikedItem.DoesNotExist:
            return Response({"type": "liked", "items": []}, status=status.HTTP_200_OK)

        serialized_items = LikedItemSerializer(liked_items_instance).data
        response_data = {
            "type": "liked",
            "items": serialized_items.get('items', [])  
        }
        return Response(response_data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        user = request.user
        post_id = request.data.get('object_id')

        if not post_id:
            return Response({"error": "Post ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        author_serialized_data = AuthorSerializer(user).data
        liked_item_data = {
            "summary": f"{author_serialized_data['displayName']} Likes your post",
            "type": "Like",
            "author": author_serialized_data,
            "object": post_id
        }
        liked_items_instance, created = LikedItem.objects.get_or_create(user=user)
 
        if not any(item['object'] == liked_item_data['object'] for item in liked_items_instance.items):
            liked_items_instance.items.append(liked_item_data)
            liked_items_instance.save()
            return Response({"message": "Like successfully added."}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "You have already liked this post."}, status=status.HTTP_409_CONFLICT)


class LikeCommentView(APIView):
    # permission_classes = [IsAuthenticated] 

    def post(self, request, comment_id, post_id):
        
        author_data = request.data.get('actor')
        comment_data = request.data.get('object')

        if not author_data or not comment_data:
            return Response({"error": "Author and Comment data are required."}, status=status.HTTP_400_BAD_REQUEST)

        comment_id = comment_data['id']

        try:
            comment = Comments.objects.get(id=comment_id)
        except Post.DoesNotExist:
            return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the author has already liked this post
        if any(author['id'] == author_data['id'] for author in comment.liked_by):
            return Response({"message": "You have already liked this comment."}, status=status.HTTP_409_CONFLICT)

        # Append the new like to the liked_by field
        comment.liked_by.append(author_data)
        comment.likes += 1
        comment.save()

        # Send like notification to the author's inbox
        # author_id_url = post_data['author']['id']
        # parts = author_id_url.split('/')
        # parts.insert(3, 'api')
        # author_inbox_url = '/'.join(parts) + '/inbox/'
        # liked_by_message = {
        #     "summary": f"{author_data['displayName']} Likes your post",
        #     "type": "Like",
        #     "author": author_data,
        #     "object": post_data['id']
        # }

        # try:
        #     response = requests.post(author_inbox_url, json=liked_by_message, headers={"Content-Type": "application/json"})
        #     if response.status_code in [200, 201]:
        #         return Response({"message": "Like notification sent successfully."}, status=status.HTTP_204_NO_CONTENT)
        #     else:
        #         return Response({"error": "Failed to send like notification to the author's inbox.", "status_code": response.status_code}, status=status.HTTP_400_BAD_REQUEST)
        # except requests.exceptions.RequestException as e:
        #     return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Like successfully recorded."}, status=status.HTTP_204_NO_CONTENT)


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
        
        
        
               
        
class ListFollowersView(APIView):
    
    def get(self, request, author_id, *args, **kwargs):
        user = get_object_or_404(User, id=author_id)
        follower_list_instance, _ = FollowerList.objects.get_or_create(user=user)
        followers_data = follower_list_instance.followers
        data = {
            "type": "followers",
            "items": followers_data
        }
        return Response(data)


    
class NodesView(APIView):
    def get(self, request, format=None):
        nodes, _ = Nodes.objects.get_or_create()
        serializer = NodesSerializer(nodes)
        return Response(serializer.data, status=status.HTTP_200_OK)    


class FriendRequestView(APIView):
    def post(self, request, *args, **kwargs):
        to_follow = request.data.get('to_follow')
        if not to_follow:
            return Response({"error": "Missing 'to_follow' information."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if not request.user.is_anonymous else get_object_or_404(User, id=10)
        original_url = to_follow.get('url')
        parts = original_url.split('/')
        if len(parts) > 3 and parts[3] == 'authors':
            parts.insert(3, 'api')  
            inbox_url = '/'.join(parts) + "/inbox/"
        user_serializer = AuthorSerializer(user)

        friend_request_data = {
            "type": "Follow",
            "summary": f"{user.username} wants to follow {to_follow.get('displayName')}",
            "actor": user_serializer.data,
            "object": to_follow,
        }

        try:
            response = requests.post(inbox_url, json=friend_request_data, headers={"Content-Type": "application/json"})
            if response.status_code in [200, 201]:
                return Response({"message": "Friend request sent successfully."}, status=status.HTTP_201_CREATED)
            else:
                return Response({"error": "Failed to send friend request."}, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

class InboxView(APIView):
    def get(self, request, author_id, *args, **kwargs):
        friend = get_object_or_404(User, id=author_id)
        inbox, _ = Inbox.objects.get_or_create(user=friend)
        serializer = InboxSerializer(inbox)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, author_id, *args, **kwargs):
        friend = get_object_or_404(User, id=author_id)
        inbox, created = Inbox.objects.get_or_create(user=friend)
        content = inbox.content  
        content.append(request.data) 
        inbox.content = content 
        inbox.save() 

        if request.data.get('type') == 'Like':
            post_url = request.data.get('object', '')
            post_id = post_url.split('/')[-1]
            
            try:
                post = Post.objects.get(id=post_id)
                # Prevent duplicate entries for the same author
                if not any(author['id'] == request.data['author']['id'] for author in post.liked_by):
                    post.liked_by.append(request.data['author'])
                    post.likes += 1 
                    post.save()
            except Post.DoesNotExist:
                pass

        serializer = InboxSerializer(inbox)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)
    
    def put(self, request, author_id, *args, **kwargs):
        friend = get_object_or_404(User, id=author_id)
        inbox = Inbox.objects.get(user=friend)

        item_to_update = request.data
        updated = False

        for index, content_item in enumerate(inbox.content):
            if content_item['id'] == item_to_update['id']:  
                inbox.content[index] = item_to_update
                updated = True
                break

        if updated:
            inbox.save()
            return Response({"message": "Item updated successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, author_id, *args, **kwargs):

        friend = get_object_or_404(User, id=author_id)
        inbox = Inbox.objects.get(user=friend)

        item_to_delete_id = request.data.get('id') 
        initial_length = len(inbox.content)

        inbox.content = [item for item in inbox.content if item.get('id') != item_to_delete_id]

        if len(inbox.content) < initial_length:
            inbox.save()
            return Response({"message": "Item deleted successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

    

class AcceptFollowRequest(APIView):
    def post(self, request, author_id, *args, **kwargs):
        author_to_follow = get_object_or_404(User, id=author_id)
        inbox, _ = Inbox.objects.get_or_create(user=author_to_follow)

        data = request.data
        actor_id = data['actor']['id'].split('/')[-1]
        
        # Update the inbox to remove the follow request
        updated_content = [item for item in inbox.content if item != data]
        inbox.content = updated_content
        inbox.save()

        if actor_id == str(author_id):
            return Response({"error": "You can't follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        requester_info = data.get('actor')  # This is the follower_info expected by FollowerList model

        # Ensure a FollowerList instance exists for the user being followed
        follower_list, _ = FollowerList.objects.get_or_create(user=author_to_follow)

        # Check if the requester is already a follower
        if any(follower['id'] == requester_info['id'] for follower in follower_list.followers):
            return Response({"error": "You're already following this author."}, status=status.HTTP_400_BAD_REQUEST)

        # Add the requester to the follower list
        follower_list.add_follower(requester_info)
        
        return Response({"success": "Follow request accepted."}, status=status.HTTP_201_CREATED)
        
        
        
        
    
    
    
