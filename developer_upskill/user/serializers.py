from .models import CustomUser, Profile
from rest_framework import serializers

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('email', 'name', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser(
            email=validated_data['email'],
            name=validated_data['name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio', 'avatar_url', 'total_xp']
        read_only_fields = ['total_xp']

# NEW: Main serializer for viewing and updating user details
class UserDetailSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'profile']
        read_only_fields = ['email', 'id'] # Don't allow email changes for simplicity

    def update(self, instance, validated_data):
        # Handle nested profile data update
        profile_data = validated_data.pop('profile', {})
        profile = instance.profile

        # Update CustomUser fields (e.g., name)
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        # Update Profile fields (e.g., bio, avatar_url)
        profile.bio = profile_data.get('bio', profile.bio)
        profile.avatar_url = profile_data.get('avatar_url', profile.avatar_url)
        profile.save()

        return instance