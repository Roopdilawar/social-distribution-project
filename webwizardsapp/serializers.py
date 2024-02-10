from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'password': {'required': True},
            'password2': {'required': True},
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
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
