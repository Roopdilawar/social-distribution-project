from django.contrib import admin

# Register your models here.
from .models import User, Post, Comments,Followers,Inbox

admin.site.register(User)
admin.site.register(Followers)
admin.site.register(Post)
admin.site.register(Comments)
admin.site.register(Inbox)
