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
        ('PRIVATE', 'Private'),
    ]
    # other fields...
    
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
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES)
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
    likes = models.IntegerField(default=0)
    liked_by = models.ManyToManyField(User, related_name='liked_comments',)

    @property
    def likes(self):
        return self.liked_by.count()

    def __str__(self):
        return f'Comment by {self.author.username} on {self.post.title}'
    
    


class Followers(models.Model):
    author_to_follow = models.ForeignKey(User, related_name='follower', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created = models.DateTimeField(default=timezone.now)
    
    @staticmethod
    def are_friends(user1, user2):
        return Followers.objects.filter(author_to_follow=user1, author=user2).exists() and \
               Followers.objects.filter(author_to_follow=user2, author=user1).exists()
               
    @staticmethod           
    def follow(user1, user2):
        if Followers.are_friends(user1, user2):
            raise ValueError("You can't follow someone you're already following.")
            
    
    class Meta:
        unique_together = ('author_to_follow', 'author')
        


class Inbox(models.Model):
    user = models.ForeignKey(User, related_name='inbox', on_delete=models.CASCADE)
    content=models.JSONField(default=list, blank=True)
    
    
    