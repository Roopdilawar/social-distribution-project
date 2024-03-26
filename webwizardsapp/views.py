from django.contrib.auth import authenticate
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .authentication import ServerBasicAuthentication
from .models import User,Post,Comments,FollowerList,Inbox,LikedItem,ServerCredentials
from rest_framework import generics
from rest_framework.generics import UpdateAPIView, DestroyAPIView
from django.shortcuts import get_object_or_404
from rest_framework.generics import CreateAPIView
from .serializers import RegisterSerializer,AuthorSerializer,PostSerializer,CommentSerializer,InboxSerializer,LikedItemSerializer,ServerCredentialsSerializer
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

from rest_framework.pagination import PageNumberPagination
from django.core.paginator import Paginator


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


class CustomPagination(PageNumberPagination):
    page_size = 5
    max_page_size = 1000000

    def get_page_size(self, request):
        if request.query_params.get('all') == 'true':
            return self.max_page_size
        return super().get_page_size(request)

    def get_paginated_response(self, data):
        return Response({
            'type': self.request.parser_context['view'].pagination_type,
            'next': self.get_next_link(),
            'prev': self.get_previous_link(),
            'items': data,
        })


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')  # Or change 'username' to the correct key
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
    pagination_class = CustomPagination
    pagination_type = 'authors'

    
    
class AuthorDetailView(generics.RetrieveAPIView,UpdateAPIView,DestroyAPIView):
    
    queryset = User.objects.all()
    serializer_class = AuthorSerializer
    def retrieve(self, request, *args, **kwargs):
        response = super(AuthorDetailView, self).retrieve(request, *args, **kwargs)
        
        return response


class PublicPostsView(generics.ListAPIView):
    queryset = Post.objects.filter(visibility='PUBLIC').order_by('-published')
    serializer_class = PostSerializer
    pagination_class = CustomPagination
    pagination_type = 'posts'

    def get(self, request, *args, **kwargs):
        # Get the page from the pagination class
        page = self.paginate_queryset(self.get_queryset())
        
        # If the page object is created, serialize the page and return the data directly
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            # Here you can modify or directly return the serialized data as per your original response structure
            return self.get_paginated_response(serializer.data)

        # If not paginated, serialize the entire queryset
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)
    


class AuthorPostsView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    pagination_class = CustomPagination
    pagination_type = 'posts'

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

            # Iterate through author's followers
            for follower_info in follower_list_instance.followers:

                # For every follower of the author, iterate through THEIR followers
                base_url = follower_info['host']

                followers_followers_list_url = f"{base_url}api/authors/{follower_info['id'].split('/').pop()}/followers/"

                try :
                    # Get list of follower followers
                    response = requests.get(followers_followers_list_url)

                    followers_followers_list = response.json()['items']

                    am_follower = False
                    
                    # Iterate through all of their followers and check if we are a member of the list
                    for follower_followers_info in followers_followers_list:
                        if author.id == int(follower_followers_info['id'].split('/').pop()):
                            am_follower = True
                            break
                    
                    # If we are one of the users they are following
                    if am_follower == True:
                        print('gooood')
                        # Get the inbox url
                        base_url, author_segment = follower_info['id'].rsplit('/authors/', 1)
                        inbox_url = f"{base_url}/api/authors/{author_segment}/inbox/"
                        
                        try:
                            # Post to their inbox
                            response = requests.post(inbox_url, json=post_data, headers={"Content-Type": "application/json"})
                            if response.status_code not in (200, 201):
                                print(f"Failed to post to {inbox_url}. Status code: {response.status_code}")
                        except requests.exceptions.RequestException as e:
                            print(f"Request to {inbox_url} failed: {e}")


                except requests.exceptions.RequestException as e:
                    print(f"Request to {inbox_url} failed: {e}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
       


class GetImageView(APIView):
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



class CommentView(generics.ListCreateAPIView):
    authentication_classes = [ServerBasicAuthentication]
    serializer_class = CommentSerializer
    pagination_class = CustomPagination
    pagination_type = 'comments'

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comments.objects.filter(post_id=post_id)

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = Post.objects.get(id=post_id)
        post_author = post.author
        inbox, _ = Inbox.objects.get_or_create(user=post_author)
        
        author = self.request.data.get('author')
        comment_type = serializer.validated_data.get('type', 'Comment') 
        comment_content = serializer.validated_data.get('content')

        comment_data = {
            "type": comment_type,
            "summary": f"{author['displayName']} commented on your post",
            "comment": comment_content, 
            "author": author 
        }
        
        inbox.content.append(comment_data)
        inbox.save()
        serializer.save(post=post)

    
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer

    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['comment_id'])
        return obj

    def put(self, request, *args, **kwargs):
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
    authentication_classes = [ServerBasicAuthentication]

    def post(self, request, author_id, *args, **kwargs):
        author_data = request.data.get('actor')
        post_data = request.data.get('object')

        if not author_data or not post_data:
            return Response({"error": "Author and Post data are required."}, status=status.HTTP_400_BAD_REQUEST)

        post_id = post_data['id'].split('/')[-1]

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


class LikesView(APIView):
    def get(self, request, author_id, post_id, format=None):
        post = get_object_or_404(Post, author_id=author_id, id=post_id)
        response_data = {
            "type": "likes",
            "items": post.likes_objects
        }
        return Response(response_data, status=status.HTTP_200_OK)


class LikedItemsView(APIView):

    def get(self, request, author_id, *args, **kwargs):
        user = User.objects.get(id=author_id)
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
    def post(self, request, author_id, comment_id, post_id):
        
        author_data = request.data.get('author')
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
    pagination_class = CustomPagination
    pagination_type = 'inbox'

    def get(self, request, *args, **kwargs):
        author_id = self.kwargs.get('author_id')
        inbox, _ = Inbox.objects.get_or_create(user_id=author_id)
        contents = inbox.content

        page_size = self.pagination_class().get_page_size(request)
        paginator = Paginator(contents, page_size)
        page_number = request.query_params.get('page', 1)
        page_obj = paginator.get_page(page_number)

        base_url = request.build_absolute_uri()
        next_page = page_obj.next_page_number() if page_obj.has_next() else None
        prev_page = page_obj.previous_page_number() if page_obj.has_previous() else None

        next_link = f"{base_url}?page={next_page}" if next_page else None
        prev_link = f"{base_url}?page={prev_page}" if prev_page else None

        response_data = {
            "type": "inbox",
            "id": f"http://localhost:8000/api/authors/{author_id}/",
            "next": next_link,
            "prev": prev_link,
            "items": page_obj.object_list
        }

        return Response(response_data)
    
    def post(self, request, author_id, *args, **kwargs):
        friend = get_object_or_404(User, id=author_id)
        inbox, created = Inbox.objects.get_or_create(user=friend)

        if request.data.get('type') == 'Like':
            post_url = request.data.get('object', '')
            post_id = post_url.split('/')[-1]
            
            try:
                post = Post.objects.get(id=post_id)
                # Prevent duplicate entries for the same author
                if not any(author['id'] == request.data['author']['id'] for author in post.liked_by):
                    post.liked_by.append(request.data['author'])
                    post.likes_objects.append(request.data)
                    post.likes += 1 
                    post.save()
                else:
                    # The user has already liked the post, so return a failure response
                    return Response({"error": "You have already liked this post."}, status=status.HTTP_409_CONFLICT)
            except Post.DoesNotExist:
                pass
        
        elif request.data.get('type') == 'Unfollow':
            actor_id = request.data.get('actor', {}).get('id', '')
            try:
                follower_list_instance = FollowerList.objects.get(user=friend)
                # Attempt to remove the follower based on 'actor_id'
                updated_followers = [follower for follower in follower_list_instance.followers if follower['id'] != actor_id]
                follower_list_instance.followers = updated_followers
                follower_list_instance.save()
            except FollowerList.DoesNotExist:
                return Response({"error": "Follower list not found for the specified user."}, status=status.HTTP_404_NOT_FOUND)
            
        content = inbox.content  
        content.append(request.data) 
        inbox.content = content 
        inbox.save() 

        serializer = InboxSerializer(inbox)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)
    
    def put(self, request, author_id, *args, **kwargs):
        friend = get_object_or_404(User, id=author_id)
        inbox = Inbox.objects.get(user=friend)

        item_to_update = request.data
        updated = False

        for index, content_item in enumerate(inbox.content):
            if content_item.get('id', None) == item_to_update.get('id', False):  
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
        
        

class ServerCredentialsView(APIView):
    def get(self, request, *args, **kwargs):
        credentials = ServerCredentials.objects.all()
        serializer = ServerCredentialsSerializer(credentials, many=True)
        response_data = {item['server_url']: {'outgoing_username': item['outgoing_username'], 'outgoing_password': item['outgoing_password']} for item in serializer.data}
        return Response(response_data)