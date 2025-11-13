from django.db.models import Q
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.permissions import (
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
    AllowAny,
)
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied  # NEW

from .filters import SkillFilter
from .permissions import (
    CanReviewSkill,
    IsOwnerOrReadOnly,
    IsPathOwnerOrReadOnly,
    IsSkillOwnerOrReadOnly,
)
from user.models import Profile
from django.db import transaction
from .models import (
    LearningPath,
    PathEnrollment,
    Review,
    PathItem,
    Skill,
    Resource,
    Enrollment,
    ResourceCompletion,
    Comment,
    Tag,
    UserBadge,
)
from .serializers import (
    CommentSerializer,
    LearningPathDetailSerializer,
    LearningPathListSerializer,
    PathEnrollmentSerializer,
    PathItemManageSerializer,
    ProfileLeaderboardSerializer,
    ReviewSerializer,
    SkillSerializer,
    ResourceSerializer,
    EnrollmentSerializer,
    LeaderboardSerializer,
    TagSerializer,
    UserBadgeSerializer,
)
from rest_framework.views import APIView


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_class = SkillFilter

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Skill.objects.filter(
                Q(created_by=self.request.user) | Q(is_public=True)
            ).distinct()
        return Skill.objects.filter(is_public=True)
    
    def retrieve(self, request, *args, **kwargs):
        skill = self.get_object() # Get the skill we're trying to view
        user = request.user

        # Public, anonymous users can always view public skills
        if not user.is_authenticated:
            if skill.is_public:
                serializer = self.get_serializer(skill)
                return Response(serializer.data)
            raise PermissionDenied("You must be logged in to view this skill.")

        # --- Skill Lock Logic ---
        # Find all path items this skill is a part of
        path_items = PathItem.objects.filter(skill=skill)
        
        for item in path_items:
            # If the skill is part of a path (e.g., order > 0)
            if item.order > 0:
                try:
                    # Check if the user is actually enrolled in this path
                    PathEnrollment.objects.get(user=user, path=item.path)
                    
                    # If they are enrolled, find the *previous* skill in the path
                    previous_item = PathItem.objects.get(path=item.path, order=item.order - 1)
                    previous_skill = previous_item.skill
                    
                    # Now, check the user's progress on that *previous* skill
                    try:
                        prev_enrollment = Enrollment.objects.get(user=user, skill=previous_skill)
                        if prev_enrollment.progress < 100:
                            # User hasn't finished the prerequisite! Skill is locked.
                            raise PermissionDenied(
                                f"This skill is locked. You must complete '{previous_skill.name}' first."
                            )
                    except Enrollment.DoesNotExist:
                        # User isn't even enrolled in the prerequisite. Skill is locked.
                        raise PermissionDenied(
                            f"This skill is locked. You must enroll in and complete '{previous_skill.name}' first."
                        )

                except PathEnrollment.DoesNotExist:
                    # The user isn't enrolled in this path, so this specific lock doesn't apply.
                    # Continue checking other paths this skill might be in.
                    pass
                except PathItem.DoesNotExist:
                    # This should not happen if path orders are correct, but as a failsafe:
                    pass

        # If we get through the whole loop, the skill is not locked for this user.
        serializer = self.get_serializer(skill)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        skill = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user, skill=skill
        )
        if created:
            enrollment.update_progress()
            return Response(
                {"status": "enrolled successfully"}, status=status.HTTP_201_CREATED
            )
        return Response({"status": "already enrolled"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_skills(self, request):
        """
        Returns all skills created by the currently authenticated user.
        """
        queryset = Skill.objects.filter(created_by=request.user).order_by("-created_at")
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    @transaction.atomic  # Ensures this either all succeeds or all fails
    def fork(self, request, pk=None):
        """
        Creates a private copy (a "fork") of a public skill for the logged-in user.
        """
        try:
            original_skill = self.get_object()

            # 1. Check if the skill is public
            if not original_skill.is_public:
                return Response(
                    {"error": "You can only fork public skills."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # 2. Check if user has already forked this
            # We check by the name and original description to prevent multiple forks
            if Skill.objects.filter(
                created_by=request.user,
                name=f"{original_skill.name} (Forked)",
            ).exists():
                return Response(
                    {"error": "You have already forked this skill."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 3. Create the new forked skill
            new_skill = Skill.objects.create(
                name=f"{original_skill.name} (Forked)",
                description=original_skill.description,
                created_by=request.user,
                is_public=False,  # Forks are private by default
            )

            # 4. Copy all resources from the original skill
            original_resources = original_skill.resources.all()
            new_resources = []
            for resource in original_resources:
                new_resources.append(
                    Resource(
                        skill=new_skill,
                        title=resource.title,
                        url=resource.url,
                        resource_type=resource.resource_type,
                        order=resource.order,
                        xp=resource.xp,  # Copy the XP value as well
                    )
                )

            if new_resources:
                Resource.objects.bulk_create(new_resources)

            # 5. Copy all tags
            new_skill.tags.set(original_skill.tags.all())

            # 6. Return the new skill data
            serializer = self.get_serializer(new_skill)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsSkillOwnerOrReadOnly]  # Assuming you added this permission

    def perform_create(self, serializer):
        skill = serializer.validated_data["skill"]

        # Check if the user owns the skill
        if skill.created_by != self.request.user:
            raise PermissionDenied(
                "You do not have permission to add resources to this skill."
            )

        # If they own it, save the resource
        serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        resource = self.get_object()
        try:
            enrollment = Enrollment.objects.get(user=request.user, skill=resource.skill)
        except Enrollment.DoesNotExist:
            return Response(
                {"error": "You are not enrolled in this skill."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # MODIFIED: Use a transaction for data safety
        with transaction.atomic():
            completion, created = ResourceCompletion.objects.get_or_create(
                enrollment=enrollment, resource=resource
            )
            if created:
                # Update progress and streak
                enrollment.update_progress()
                enrollment.update_streak()

                # NEW: Update user's total XP
                profile = request.user.profile
                profile.total_xp += resource.xp
                profile.save()

                return Response(
                    {
                        "status": "resource marked as complete",
                        "progress": enrollment.progress,
                        "streak": enrollment.current_streak,
                        "total_xp": profile.total_xp,  # Send back new total XP
                    },
                    status=status.HTTP_201_CREATED,
                )

        return Response(
            {"status": "resource already completed"}, status=status.HTTP_200_OK
        )


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related(
            "skill", "user"
        )


# New ViewSet for the Leaderboard
class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides a ranked list of enrollments for a specific skill, ordered by progress.
    Access via /api/skills/{skill_pk}/leaderboard/
    """

    serializer_class = LeaderboardSerializer
    permission_classes = [AllowAny]  # Anyone can view a public leaderboard

    def get_queryset(self):
        skill_pk = self.kwargs["skill_pk"]
        # Order by highest progress, then highest streak
        return Enrollment.objects.filter(skill_id=skill_pk).order_by(
            "-progress", "-current_streak"
        )


class GlobalLeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides a ranked list of all users by their total XP.
    Access via /api/leaderboard/
    """

    queryset = Profile.objects.select_related("user").order_by("-total_xp")
    serializer_class = ProfileLeaderboardSerializer
    permission_classes = [AllowAny]


class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for comments on a skill.
    Access via /api/skills/{skill_pk}/comments/
    """

    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        # Only return top-level comments (replies are nested in the serializer)
        return Comment.objects.filter(
            skill_id=self.kwargs["skill_pk"], parent__isnull=True
        ).select_related("user")

    def perform_create(self, serializer):
        # Automatically associate the comment with the skill from the URL and the logged-in user
        skill = Skill.objects.get(pk=self.kwargs["skill_pk"])
        serializer.save(user=self.request.user, skill=skill)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for reviews on a skill.
    Access via /api/skills/{skill_pk}/reviews/
    """

    serializer_class = ReviewSerializer
    permission_classes = [CanReviewSkill, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Review.objects.filter(skill_id=self.kwargs["skill_pk"]).select_related(
            "user"
        )

    def perform_create(self, serializer):
        skill = Skill.objects.get(pk=self.kwargs["skill_pk"])
        # Check if the user has already reviewed
        if Review.objects.filter(skill=skill, user=self.request.user).exists():
            raise serializers.ValidationError("You have already reviewed this skill.")
        serializer.save(user=self.request.user, skill=skill)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to list all available tags.
    """

    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer
    permission_classes = [AllowAny]


class LearningPathViewSet(viewsets.ModelViewSet):
    # MODIFIED: Use our new permission class
    permission_classes = [IsPathOwnerOrReadOnly]
    queryset = LearningPath.objects.all()  # We'll filter this in get_queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return LearningPathDetailSerializer
        # NEW: Use our validation serializer for the manage_skills action
        if self.action == "manage_skills":
            return PathItemManageSerializer
        return LearningPathListSerializer

    def get_queryset(self):
        # This queryset logic is correct and should remain
        if self.request.user.is_authenticated:
            return LearningPath.objects.filter(
                Q(created_by=self.request.user) | Q(is_public=True)
            ).distinct()
        return LearningPath.objects.filter(is_public=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_paths(self, request):
        """
        Returns all learning paths created by the currently authenticated user.
        """
        queryset = LearningPath.objects.filter(created_by=request.user).order_by(
            "-created_at"
        )
        # Use the 'list' serializer
        serializer = LearningPathListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        path = self.get_object()
        enrollment, created = PathEnrollment.objects.get_or_create(
            user=request.user, path=path
        )
        if created:
            # Auto-enroll in all skills within the path
            for item in path.items.all():
                Enrollment.objects.get_or_create(user=request.user, skill=item.skill)
            enrollment.update_progress()
            return Response(
                {"status": "enrolled in path successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"status": "already enrolled in path"}, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["put"], permission_classes=[IsPathOwnerOrReadOnly])
    def manage_skills(self, request, pk=None):
        """
        Replaces the entire set of skills for a learning path.
        Expects a PUT request with: { "skill_ids": [1, 5, 2] }
        """
        path = self.get_object()

        # --- THIS IS THE FIX ---
        # We must pass the request context to the serializer
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        # --- END OF FIX ---

        serializer.is_valid(raise_exception=True)

        # Use .get() to safely handle an empty list
        skill_ids = serializer.validated_data.get("skill_ids", [])

        try:
            with transaction.atomic():
                # 1. Delete all existing skill items for this path
                path.items.all().delete()

                if skill_ids:  # Only run if the list isn't empty
                    # 2. Create new PathItem objects from the provided list
                    new_path_items = [
                        PathItem(
                            path=path, skill_id=skill.id, order=index
                        )  # Use skill.id
                        for index, skill in enumerate(
                            skill_ids
                        )  # The validator returns skill objects
                    ]

                    # 3. Bulk create them for efficiency
                    PathItem.objects.bulk_create(new_path_items)

        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Return the updated learning path
        path_serializer = LearningPathDetailSerializer(
            path, context={"request": request}
        )
        return Response(path_serializer.data, status=status.HTTP_200_OK)


# NEW: ViewSet for a user's Path Enrollments
class PathEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PathEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PathEnrollment.objects.filter(user=self.request.user).select_related(
            "path"
        )


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to list all badges earned by the authenticated user.
    Access via /api/my-badges/
    """

    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user).select_related(
            "badge", "badge__skill"
        )


class GlobalSearchAPIView(APIView):
    """
    Provides a global search across Skills and Learning Paths.
    Access via /api/search/?q=<query>
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        query_param = request.query_params.get("q", None)

        if not query_param:
            return Response(
                {"error": "A 'q' query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Search Skills
        skill_results = Skill.objects.filter(
            Q(is_public=True)  # Must be public
            & (
                Q(name__icontains=query_param)
                | Q(description__icontains=query_param)
                | Q(tags__name__icontains=query_param)
            )
        ).distinct()

        # 2. Search Learning Paths
        path_results = LearningPath.objects.filter(
            Q(is_public=True)  # Must be public
            & (Q(title__icontains=query_param) | Q(description__icontains=query_param))
        ).distinct()

        # 3. Serialize the data
        skill_serializer = SkillSerializer(
            skill_results, many=True, context={"request": request}
        )
        path_serializer = LearningPathListSerializer(
            path_results, many=True, context={"request": request}
        )

        # 4. Return the combined, structured response
        return Response(
            {
                "skills": skill_serializer.data,
                "paths": path_serializer.data,
            }
        )
