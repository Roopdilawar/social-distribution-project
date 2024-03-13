from django.contrib import admin

# Register your models here.
from .models import User, Post, Comments,Followers

admin.site.register(User)
admin.site.register(Followers)
admin.site.register(Post)
admin.site.register(Comments)
