from rest_framework import serializers
from .models import Skill, Resource, Enrollment

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'title', 'url', 'resource_type', 'order']


class SkillSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Skill
        fields = ['id', 'name', 'description', 'is_public', 'created_by', 'created_by_username', 'resources']
        read_only_fields = ['created_by']


class EnrollmentSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'user', 'username', 'skill', 'enrolled_on', 'progress', 'current_streak'] # Added current_streak
        read_only_fields = ['user', 'skill']

# A new, simpler serializer for the leaderboard
class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['username', 'progress', 'current_streak']