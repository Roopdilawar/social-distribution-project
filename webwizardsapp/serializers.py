from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User,Post,Comments,Followers,Inbox


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
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
    
class AuthorSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default='author',read_only=True)
    id = serializers.SerializerMethodField()
    url = serializers.CharField(default='url') # Need to update
    host = serializers.CharField(default='host') # Need to update
    displayName = serializers.CharField(source='username')
    github = serializers.URLField() 
    profileImage = serializers.URLField(source='profile_picture')
    
    def get_id(self, obj):
        return f"http://127.0.0.1:5454/authors/{obj.id}"
    

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        # instance.bio = validated_data.get('bio', instance.bio)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()
        return instance
    
    class Meta:
        model = User
        fields = ('type', 'id', 'url', 'host', 'displayName', 'github', 'profileImage')
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'user_email', 'profile_picture']       
        




class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    type = serializers.CharField(default='post',read_only=True)
    class Meta:
        model = Post
        fields = ['type', 'id', 'title', 'source', 'origin', 'description', 'content_type', 'content', 'author', 'Comment_counts', 'likes', 'published', 'visibility']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        post_id = instance.id
        representation['id'] = f"http://127.0.0.1:5454/authors/{instance.author.id}/posts/{post_id}"
        representation['Comment_counts'] = instance.comments.all().count()

        return representation

    
    
        
class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    
    
    class Meta:
        model = Comments
        fields = ['id', 'post', 'author', 'content', 'created']
        
        
class FollowerSerializer(serializers.Serializer):
    type = serializers.SerializerMethodField(method_name='get_author_type')
    id = serializers.SerializerMethodField(method_name='get_author_id')
    url = serializers.SerializerMethodField(method_name='get_author_url')
    host = serializers.SerializerMethodField(method_name='get_author_host')
    displayName = serializers.SerializerMethodField(method_name='get_author_displayName')
    github = serializers.SerializerMethodField(method_name='get_author_github')
    profileImage = serializers.SerializerMethodField(method_name='get_author_profileImage')

    class Meta:
        model = Followers
        fields = ('type', 'id', 'url', 'host', 'displayName', 'github', 'profileImage')

    def get_author_type(self, obj):
        return "author"

    def get_author_id(self, obj):
        # Assuming you want to show the 'author_to_follow' details
        return f"http://127.0.0.1:5454/authors/{obj.author_to_follow.pk}"

    def get_author_url(self, obj):
        return f"http://127.0.0.1:5454/authors/{obj.author_to_follow.pk}"

    def get_author_host(self, obj):
        return "http://127.0.0.1:5454/"

    def get_author_displayName(self, obj):
        return obj.author_to_follow.username  # Adjust the field name as necessary based on your User model

    def get_author_github(self, obj):
        return obj.author_to_follow.github_url if hasattr(obj.author_to_follow, 'github_url') else ""

    def get_author_profileImage(self, obj):

        return obj.author_to_follow.profile_image_url if hasattr(obj.author_to_follow, 'profile_image_url') else ""
    
    def create(self, validated_data):
        return Followers.objects.create(**validated_data)
    
    
    
    
    
    
    
    
    
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
