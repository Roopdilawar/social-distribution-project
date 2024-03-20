from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.db.models import JSONField
from django.utils.timezone import make_aware
from datetime import datetime




class User(AbstractUser):
    # Need to add a few more fields (github, url, host, id)
    # user_email = models.EmailField(unique=True)
    profile_picture = models.URLField(max_length=100000000, blank=True, default='https://imgur.com/a/i9xknax')
    github = models.CharField(max_length=39, blank=True, null=True)
    bio = models.CharField(max_length=200, blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    # user_id = models.CharField(max_length=500)
    url = models.CharField(max_length=500, default='http://localhost:8000/')
    host = models.CharField(max_length=500, default='http://localhost:8000/')
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
    def save(self, *args, **kwargs):
        # Call the "real" save() method.
        super().save(*args, **kwargs)

        if not self.inbox:
            # Create a new portfolio and assign it to the user.
            inbox= Inbox.objects.create(user=self)
            self.inbox = inbox
            self.save()
    

    



class Post(models.Model):
    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('FRIENDS', 'Friends'),
        ('UNLISTED', 'Unlisted'),
    ]
    
    type = models.CharField(default='post', max_length=200)
    title = models.CharField(max_length=200, blank=True)
    source = models.URLField(max_length=200, default='https://uofa-cmput404.github.io/general/project.html')
    origin = models.CharField(max_length=200, default='https://uofa-cmput404.github.io/general/project.html')
    description = models.CharField(max_length=200, default='This is a post')
    content_type = models.CharField(max_length=200, default='text/plain')
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    comment_counts = models.IntegerField(default=0)
    likes = models.IntegerField(default=0) 
    liked_by = JSONField(default=list, blank=True)    
    published = models.DateTimeField(default=timezone.now)
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES)

    @property
    def likes_count(self):
        return len(self.liked_by)
    

class LikedItem(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='liked_items')
    items = JSONField(default=list)  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s liked items"


class Comments(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created = models.DateTimeField(default=timezone.now)
    likes = models.IntegerField(default=0)
    liked_by = JSONField(default=list, blank=True)    

    @property
    def likes_count(self):
        return len(self.liked_by)

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'
    
    


class FollowerList(models.Model):
    user = models.OneToOneField(User, related_name='followers', on_delete=models.CASCADE)
    followers = models.JSONField(default=list, blank=True)

    def add_follower(self, follower_info):
        if not any(follower['id'] == follower_info['id'] for follower in self.followers):
            self.followers.append(follower_info)
            self.save()

    def remove_follower(self, follower_id):
        self.followers = [follower for follower in self.followers if follower['id'] != follower_id]
        self.save()
        


class Inbox(models.Model):
    user = models.ForeignKey(User, related_name='inbox', on_delete=models.CASCADE)
    content=models.JSONField(default=list, blank=True)


class Nodes(models.Model):
    nodes = models.JSONField(default=list, blank=True)


class GitHubLastUpdate(models.Model):
    last_update_time = models.DateTimeField(default=make_aware(datetime(1900, 1, 1)))

    @classmethod
    def get_last_update_time(cls):
        obj, created = cls.objects.get_or_create(id=1)
        return obj.last_update_time

    @classmethod
    def set_last_update_time(cls, last_update_time):
        obj, created = cls.objects.get_or_create(id=1)
        obj.last_update_time = last_update_time
        obj.save()