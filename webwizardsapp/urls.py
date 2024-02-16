from django.urls import path
from .views import LoginAPIView, RegisterView, AuthorsListView, AuthorDetailView, PostsView, SinglePostView

urlpatterns = [
    path('api/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/signup/', RegisterView.as_view(), name='signup'),
    path('api/authors/', AuthorsListView.as_view(), name='authors-list'),
    path('api/authors/<str:pk>/', AuthorDetailView.as_view(), name='author-detail'),
    path('api/posts/', PostsView.as_view(), name='posts-list'),
    path('api/posts/<int:post_id>/', SinglePostView.as_view(), name='single-post'),
]
