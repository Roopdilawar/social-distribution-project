from django.contrib import admin

# Register your models here.
from .models import User, Post, Comments,FollowerList,Inbox,LikedItem

admin.site.register(User)
admin.site.register(FollowerList)
admin.site.register(Post)
admin.site.register(Comments)
admin.site.register(Inbox)
admin.site.register(LikedItem)
