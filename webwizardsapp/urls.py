from django.urls import path
from django.urls import re_path
from . import views

from .views import LoginAPIView, RegisterView, AuthorsListView, AuthorDetailView, PostsView, DetailPostView, AddCommentView, LikePostView, ListCommentsView, CommentDetailView, GetImageView, GetUserIDView, ListFollowersView, DetailFollower, InboxView, UserBioView, UserProfilePictureView,FriendRequestView,AcceptFollowRequest,AuthorPostsView



urlpatterns = [
    path('api/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/signup/', RegisterView.as_view(), name='signup'),
    path('api/authors/', AuthorsListView.as_view(), name='authors-list'),
    path('api/authors/<str:pk>/', AuthorDetailView.as_view(), name='author-detail'),
    path('api/authors/<int:author_id>/posts/', AuthorPostsView.as_view(), name='author-posts'),
    path('api/posts/', PostsView.as_view(), name='posts-list'),
    path('api/posts/<int:post_id>/', DetailPostView.as_view(), name='single-post'),
    path('api/posts/<int:post_id>/addcomment/', AddCommentView.as_view(), name='add_comment'),
    path('api/posts/<int:post_id>/comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
    path('api/posts/<ind:post_id>/comments/<ind:comment_id>/like/', LikeCommentView.as_view(), name='like_comment'),
    path('api/posts/<int:post_id>/like/', LikePostView.as_view(), name='like_post'),
    path('api/posts/<int:post_id>/comments/', ListCommentsView.as_view(), name='list_comments'),
    path('api/posts/<int:post_id>/image', GetImageView.as_view(), name='get_image'),
    path('api/get-user-id/', GetUserIDView.as_view(), name='get_id'),
    path('api/authors/<int:author_id>/followers/', ListFollowersView.as_view(), name='list_followers'),
    path('api/authors/<int:author_id>/followers/<int:follower_id>/', DetailFollower.as_view(), name='DetailFollower'),
    path('api/authors/<int:author_id>/inbox/', InboxView.as_view(), name='inbox'),
    path('api/authors/<int:author_id>/sendfollowrequest/', FriendRequestView.as_view(), name='send_friend_request'),
    path('api/user-bio/', UserBioView.as_view(), name='get_bio'),
    path('api/user-profile-picture/', UserProfilePictureView.as_view(), name='get_profile_picture'),
    path('api/authors/<int:author_id>/acceptFollowRequest/', AcceptFollowRequest.as_view(), name='accept_follow_request'),

    re_path(r'^.*$', views.index),  # This should be the last pattern 
    

]


 