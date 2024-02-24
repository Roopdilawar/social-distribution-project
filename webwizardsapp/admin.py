from django.contrib import admin

# Register your models here.
from .models import User, UserFollowing, Post, Comments

admin.site.register(User)
admin.site.register(UserFollowing)
admin.site.register(Post)
admin.site.register(Comments)
