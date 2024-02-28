from django.urls import path
from django.urls import re_path
from . import views
from .views import LoginAPIView, RegisterView, AuthorsListView, AuthorDetailView, PostsView, FollowUserView, DetailPostView, AddCommentView, LikePostView, ListCommentsView, CommentDetailView, GetImageView, GetUserIDView

urlpatterns = [
    path('api/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/signup/', RegisterView.as_view(), name='signup'),
    path('api/authors/', AuthorsListView.as_view(), name='authors-list'),
    path('api/authors/<str:pk>/', AuthorDetailView.as_view(), name='author-detail'),
    path('api/posts/', PostsView.as_view(), name='posts-list'),
    path('api/posts/<int:post_id>/', DetailPostView.as_view(), name='single-post'),
    path('api/follow/', FollowUserView.as_view(), name='follow_user'),
    path('api/posts/<int:post_id>/addcomment/', AddCommentView.as_view(), name='add_comment'),
    path('api/posts/<int:post_id>/comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
    path('api/posts/<int:post_id>/like/', LikePostView.as_view(), name='like_post'),
    path('api/posts/<int:post_id>/comments/', ListCommentsView.as_view(), name='list_comments'),
    path('api/posts/<int:post_id>/image', GetImageView.as_view(), name='get_image'),
    path('api/get-user-id/', GetUserIDView.as_view(), name='get_id'),

    re_path(r'^.*$', views.index),  # This should be the last pattern
    
    # path('api/unfollow/<int:following_user_id>/', UnfollowUserView.as_view(), name='unfollow_user'),
]


