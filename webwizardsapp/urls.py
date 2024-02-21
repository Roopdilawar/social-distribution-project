from django.urls import path
from .views import LoginAPIView, RegisterView, AuthorsListView, AuthorDetailView, PostsView, FollowUserView, DetailPostView, AddCommentView, LikePostView

urlpatterns = [
    path('api/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/signup/', RegisterView.as_view(), name='signup'),
    path('api/authors/', AuthorsListView.as_view(), name='authors-list'),
    path('api/authors/<str:pk>/', AuthorDetailView.as_view(), name='author-detail'),
    path('api/posts/', PostsView.as_view(), name='posts-list'),
    path('api/posts/<int:post_id>/', DetailPostView.as_view(), name='single-post'),
    path('api/follow/', FollowUserView.as_view(), name='follow_user'),
    path('posts/<int:post_id>/comment/', AddCommentView.as_view(), name='add_comment'),
    path('posts/<int:post_id>/like/', LikePostView.as_view(), name='like_post'),
    
    # path('api/unfollow/<int:following_user_id>/', UnfollowUserView.as_view(), name='unfollow_user'),
]


