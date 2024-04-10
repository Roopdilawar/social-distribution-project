from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User,Post,Comments,FollowerList,Inbox,LikedItem,ServerCredentials


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'github')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'password': {'required': True},
            'password2': {'required': True},
            'github': {'required': False},
        }

    def validate(self, data):
        if len(data['password'])<8:
            raise serializers.ValidationError({"password": "Password must contain atleast 8 characters."})
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Password fields didn't match."})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "This username is already in use."})
        return data

    def create(self, validated_data):
        if validated_data['github'] != "":
            validated_data['github'] = "http://github.com/" + validated_data['github']
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            github=validated_data.get('github', ''),
            url=validated_data.get('url', 'http://localhost:8000/'),
            host=validated_data.get('host', 'http://localhost:8000/' ),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
    
class AuthorSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='author',read_only=True)
    id = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    host = serializers.CharField(default='host')
    displayName = serializers.CharField(source='username')
    github = serializers.URLField()
    profileImage = serializers.URLField(source='profile_picture')
    
    def get_id(self, obj):
        return f"{obj.host}authors/{obj.id}"
    
    def get_url(self, obj):
        return f"{obj.host}authors/{obj.id}"

    def get_host(self, obj):
        if not obj.host.endswith('/'):
            return obj.host + '/'
        else:
            return obj.host

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        # instance.bio = validated_data.get('bio', instance.bio)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()
        return instance
    
    class Meta:
        model = User
        fields = ('type', 'id', 'url', 'host', 'displayName', 'github', 'profileImage')
        





class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    type = serializers.CharField(default='post',read_only=True)
    class Meta:
        model = Post
        fields = ['type', 'id', 'title', 'source', 'origin', 'description', 'contentType', 'content', 'author', 'count', 'likes', 'published', 'visibility']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        post_id = str(instance.id)
        post_id_url = f"{instance.author.host}authors/{instance.author.id}/posts/{post_id}"
        representation['id'] = post_id_url

        representation['source'] = post_id_url
        if representation['origin'] == 'http://localhost:8000/':
            representation['origin'] = post_id_url
        representation['count'] = instance.comments.all().count()

        return representation

    
class LikedItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikedItem
        fields = '__all__'


        
class CommentSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()
    contentType = serializers.SerializerMethodField(method_name='get_content_type')
    
    class Meta:
        model = Comments
        fields = ['type', 'id', 'author', 'comment', 'contentType', 'published']
    
    def get_type(self, instance):
        return "comment"
    
    def get_id(self, instance):
        return f"{instance.post.author.host}/authors/{instance.post.author.id}/posts/{instance.post.id}/comments/{instance.id}"
    
    def get_content_type(self, instance):
        return "text/plain"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation

    
class InboxSerializer(serializers.ModelSerializer):
    post=PostSerializer(read_only=True)
    comment=CommentSerializer(read_only=True)
    
    class Meta:
        model = Inbox
        fields = ['post','comment',"content"]
        
        

from rest_framework import serializers

class FollowRequestSerializer(serializers.Serializer):
    author_to_follow_id= serializers.IntegerField()
    def create(self, validated_data):
        author_to_follow_id = validated_data.get('author_to_follow_id')
        return {
            "type": "friend_request",
            "author_to_follow_id": author_to_follow_id,
        }


class ServerCredentialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServerCredentials
        fields = ['server_url', 'outgoing_username', 'outgoing_password']