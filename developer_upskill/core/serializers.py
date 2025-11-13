from rest_framework import serializers

from user.models import Profile
from .models import (
    Badge,
    LearningPath,
    PathEnrollment,
    PathItem,
    Review,
    Skill,
    Resource,
    Enrollment,
    Comment,
    Tag,
    UserBadge,
)


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ["id", "title", "url", "resource_type", "order"]


class SkillSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
            "description",
            "is_public",
            "created_by",
            "created_by_username",
            "resources",
        ]
        read_only_fields = ["created_by"]


class EnrollmentSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "user",
            "username",
            "skill",
            "enrolled_on",
            "progress",
            "current_streak",
        ]  # Added current_streak
        read_only_fields = ["user", "skill"]


class LeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Enrollment
        fields = ["username", "progress", "current_streak"]


class ProfileLeaderboardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Profile
        fields = ["username", "total_xp"]


class ReplySerializer(serializers.ModelSerializer):
    """Serializer for nested replies."""

    username = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "username", "content", "created_at"]


class CommentSerializer(serializers.ModelSerializer):
    """Main serializer for comments, with nested replies."""

    username = serializers.CharField(source="user.name", read_only=True)
    replies = ReplySerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "username", "content", "created_at", "parent", "replies"]
        read_only_fields = ["user"]


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "username", "rating", "comment", "created_at"]
        read_only_fields = ["user"]

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class SkillSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
            "description",
            "is_public",
            "created_by",
            "created_by_username",
            "resources",
            "average_rating",
            "review_count",  # ADDED
        ]
        read_only_fields = ["created_by"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class SkillSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )

    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
            "description",
            "is_public",
            "created_by",
            "created_by_username",
            "resources",
            "average_rating",
            "review_count",
            "tags",
            "tag_names",  
        ]
        read_only_fields = ["created_by"]

    def _handle_tags(self, skill, tag_names):
        """Helper method to create/associate tags with a skill."""
        skill.tags.clear()
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name.strip().lower())
            skill.tags.add(tag)

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        skill = super().create(validated_data)
        self._handle_tags(skill, tag_names)
        return skill

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        skill = super().update(instance, validated_data)
        if tag_names is not None:
            self._handle_tags(skill, tag_names)
        return skill


class PathItemSerializer(serializers.ModelSerializer):
    """Shows the Skill details within a path."""

    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = PathItem
        fields = ["skill", "skill_name", "order"]


class LearningPathDetailSerializer(serializers.ModelSerializer):
    """Detailed view of a Learning Path, including its skills."""
    created_by_username = serializers.CharField(source='created_by.name', read_only=True)
    items = PathItemSerializer(many=True, read_only=True)

    class Meta:
        model = LearningPath
        fields = ['id', 'title', 'description', 'is_public', 'created_by_username', 'items']

class LearningPathListSerializer(serializers.ModelSerializer):
    """Simplified view for listing all Learning Paths."""
    created_by_username = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = LearningPath
        fields = ['id', 'title', 'description', 'is_public', 'created_by_username']


class PathEnrollmentSerializer(serializers.ModelSerializer):
    path = LearningPathListSerializer(read_only=True)

    class Meta:
        model = PathEnrollment
        fields = ["id", "path", "enrolled_on", "progress"]


class BadgeSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = Badge
        fields = ["id", "title", "description", "image_url", "skill_name"]


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = ["id", "badge", "earned_on"]


class PathItemManageSerializer(serializers.Serializer):
    """
    Validates a list of skill IDs.
    """

    skill_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Skill.objects.none()),
        allow_empty=True,
        required=False,  
    )

    # 2. NEW: Add an __init__ method
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        request = self.context.get("request", None)

        if request and hasattr(request, "user"):
            user_skills = Skill.objects.filter(created_by=request.user)
            self.fields["skill_ids"].child.queryset = user_skills


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        # MODIFIED: Added 'module_title'
        fields = ['id', 'title', 'url', 'resource_type', 'order', 'xp', 'skill', 'module_title']
