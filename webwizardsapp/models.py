from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    # Need to add a few more fields (github, url, host, id)
    user_email = models.EmailField()
    profile_picture = models.URLField(max_length=200, blank=True, default='https://imgur.com/a/i9xknax')
    github = models.CharField(max_length=39, blank=True, null=True)
    bio = models.CharField(max_length=200, blank=True, null=True)
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['user_email']
    

    
class UserFollowing(models.Model):
    user = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following_user = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    
    def are_friends(user1, user2):
        return FollowRequest.objects.filter(follower=user1, following=user2, accepted=True).exists() and \
               FollowRequest.objects.filter(follower=user2, following=user1, accepted=True).exists()

    class Meta:
        unique_together = ('user', 'following_user')
    


class Post(models.Model):
    type= models.CharField(default='post' ,max_length=200)
    title= models.CharField(max_length=200,blank=True,)
    source= models.URLField(max_length=200,default='https://uofa-cmput404.github.io/general/project.html')
    origin= models.CharField(max_length=200,default='https://uofa-cmput404.github.io/general/project.html')
    description= models.CharField(max_length=200, default='This is a post')
    content_type=models.CharField(max_length=200,default='text/markdown')
    content= models.TextField()
    author= models.ForeignKey(User, on_delete=models.CASCADE)
    Comment_counts= models.IntegerField(default=0)
    likes= models.IntegerField(default=0)
    published= models.DateTimeField(default=timezone.now)
    visibility= models.CharField(max_length=200,default='PUBLIC')
    liked_by = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    
    @property
    def likes(self):
        return self.liked_by.count()
    
    def update_comments_count(self):
        print("updating comments count")
        self.comments_count = self.comments.all().count()
        print(self.comments_count)
        self.save()
    
    
class Comments(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'
    
    
