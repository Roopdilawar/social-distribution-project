from django.urls import path
from django.urls import re_path
from . import views

from .views import (LoginAPIView, RegisterView, AuthorsListView, AuthorDetailView, PublicPostsView, DetailPostView, LikePostView, LikesView, CommentView, CommentDetailView, GetImageView, GetUserIDView, ListFollowersView, InboxView, UserBioView, UserProfilePictureView, FriendRequestView, AcceptFollowRequest, AuthorPostsView, LikedItemsView, LikeCommentView, ServerCredentialsView, AddCommentView, SearchUsersView)

urlpatterns = [
    path('api/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/signup/', RegisterView.as_view(), name='signup'),
    path('api/authors/', AuthorsListView.as_view(), name='authors-list'),
    path('api/authors/<uuid:pk>/', AuthorDetailView.as_view(), name='author-detail'),
    path('api/authors/<uuid:author_id>/posts/', AuthorPostsView.as_view(), name='author-posts'),
    path('api/posts/', PublicPostsView.as_view(), name='posts-list'),
    path('api/authors/<uuid:author_id>/posts/<uuid:post_id>', DetailPostView.as_view(), name='single-post'),
    path('api/authors/<uuid:author_id>/posts/<uuid:post_id>/comments/<uuid:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
    path('api/authors/<uuid:author_id>/posts/<uuid:post_id>/comments/<uuid:comment_id>/like/', LikeCommentView.as_view(), name='like_comment'),
    path('api/authors/<uuid:author_id>/like/', LikePostView.as_view(), name='like_post'),
    path('api/authors/<uuid:author_id>/liked', LikedItemsView.as_view(), name='liked-items'),
    path('api/authors/<uuid:author_id>/posts/<uuid:post_id>/likes', LikesView.as_view(), name='post-likes'),
    path('api/authors/<uuid:author_id>/posts/<uuid:post_id>/comments', CommentView.as_view(), name='post_comments'),
    path('api/authors/<uuid:author_id>/addcomment', AddCommentView.as_view(), name='add-comment'),
    path('api/authors/<uuid:author_id>/posts/<uuid:post_id>/image', GetImageView.as_view(), name='get_image'),
    path('api/get-user-id/', GetUserIDView.as_view(), name='get_id'),
    path('api/authors/<uuid:author_id>/followers', ListFollowersView.as_view(), name='list_followers'),
    path('api/authors/<uuid:author_id>/inbox', InboxView.as_view(), name='inbox'),
    path('api/authors/<uuid:author_id>/sendfollowrequest/', FriendRequestView.as_view(), name='send_friend_request'),
    path('api/user-bio/', UserBioView.as_view(), name='get_bio'),
    path('api/user-profile-picture/', UserProfilePictureView.as_view(), name='get_profile_picture'),
    path('api/authors/<uuid:author_id>/acceptFollowRequest/', AcceptFollowRequest.as_view(), name='accept_follow_request'),
    path('api/server-credentials/', ServerCredentialsView.as_view(), name='server-credentials'),
    path('search-users/', SearchUsersView.as_view(), name='search_users'),


    re_path('', views.index),  # This should be the last pattern
]
