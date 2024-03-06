from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User,Post,UserFollowing,Comments


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
        

User = User
class UserFollowingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFollowing
        fields = ['user', 'following_user']

    def validate(self, data):
        if data['user'] == data['following_user']:
            raise serializers.ValidationError("You cannot follow yourself.")
        if UserFollowing.objects.filter(user=data['user'], following_user=data['following_user']).exists():
            raise serializers.ValidationError("You are already following this user.")
        return data



class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
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
        
        
    
    

    