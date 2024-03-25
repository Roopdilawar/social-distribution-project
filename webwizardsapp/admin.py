from django.contrib import admin

# Register your models here.
from .models import User, Post, Comments,FollowerList,Inbox,LikedItem,GitHubLastUpdate,ServerCredentials

class ServerCredentialsAdmin(admin.ModelAdmin):
    list_display = ('server_name', 'server_url', 'incoming_username', 'outgoing_username')
    search_fields = ('server_name', 'server_url')

admin.site.register(User)
admin.site.register(FollowerList)
admin.site.register(Post)
admin.site.register(Comments)
admin.site.register(Inbox)
admin.site.register(LikedItem)
admin.site.register(GitHubLastUpdate)
admin.site.register(ServerCredentials, ServerCredentialsAdmin)
