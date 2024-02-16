from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Need to add a few more fields (github, url, host, id)
    user_email = models.EmailField()
    profile_picture = models.URLField(max_length=200, blank=True, default='https://imgur.com/a/i9xknax')
    bio = models.CharField(max_length=200, blank=True)
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['user_email']

class Post(models.Model):
    postID = models.IntegerField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=200)
    image = models.ImageField()
    creation_date = models.DateTimeField()
    modification_date = models.DateTimeField()
    likes = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0)

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=200)
    creation_date = models.DateTimeField()

class Likes(models.Model):
    post = models.CharField(max_length=50)
    user = models.CharField(max_length=50)

class Friends_Followers(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    friends = models.CharField(max_length=50)
    following = models.CharField(max_length=50)
    status = models.BooleanField(default = False)

class Message(models.Model):
    sender =models.CharField(max_length=50)
    receiver = models.CharField(max_length=50)
    content = models.CharField(max_length=500)
    timestamp = models.DateTimeField()



