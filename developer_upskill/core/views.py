from django.db.models import Q
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied # NEW

from .filters import SkillFilter
from .permissions import CanReviewSkill, IsOwnerOrReadOnly, IsPathOwnerOrReadOnly, IsSkillOwnerOrReadOnly
from user.models import Profile 
from django.db import transaction 
from .models import LearningPath, PathEnrollment, Review, Skill, Resource, Enrollment, ResourceCompletion,Comment, Tag, UserBadge
from .serializers import CommentSerializer, LearningPathDetailSerializer, LearningPathListSerializer, PathEnrollmentSerializer, PathItemManageSerializer, ProfileLeaderboardSerializer, ReviewSerializer, SkillSerializer, ResourceSerializer, EnrollmentSerializer, LeaderboardSerializer, TagSerializer, UserBadgeSerializer
from rest_framework.views import APIView

class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_class = SkillFilter

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Skill.objects.filter(Q(created_by=self.request.user) | Q(is_public=True)).distinct()
        return Skill.objects.filter(is_public=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        skill = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, skill=skill)
        if created:
            enrollment.update_progress()
            return Response({'status': 'enrolled successfully'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already enrolled'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_skills(self, request):
        """
        Returns all skills created by the currently authenticated user.
        """
        queryset = Skill.objects.filter(created_by=request.user).order_by('-created_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsSkillOwnerOrReadOnly] # Assuming you added this permission
    
    
    def perform_create(self, serializer):
        skill = serializer.validated_data['skill']
        
        # Check if the user owns the skill
        if skill.created_by != self.request.user:
            raise PermissionDenied("You do not have permission to add resources to this skill.")
        
        # If they own it, save the resource
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        resource = self.get_object()
        try:
            enrollment = Enrollment.objects.get(user=request.user, skill=resource.skill)
        except Enrollment.DoesNotExist:
            return Response({'error': 'You are not enrolled in this skill.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # MODIFIED: Use a transaction for data safety
        with transaction.atomic():
            completion, created = ResourceCompletion.objects.get_or_create(enrollment=enrollment, resource=resource)
            if created:
                # Update progress and streak
                enrollment.update_progress()
                enrollment.update_streak()
                
                # NEW: Update user's total XP
                profile = request.user.profile
                profile.total_xp += resource.xp
                profile.save()
                
                return Response({
                    'status': 'resource marked as complete', 
                    'progress': enrollment.progress, 
                    'streak': enrollment.current_streak,
                    'total_xp': profile.total_xp, # Send back new total XP
                }, status=status.HTTP_201_CREATED)

        return Response({'status': 'resource already completed'}, status=status.HTTP_200_OK)

class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related('skill', 'user')

# New ViewSet for the Leaderboard
class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides a ranked list of enrollments for a specific skill, ordered by progress.
    Access via /api/skills/{skill_pk}/leaderboard/
    """
    serializer_class = LeaderboardSerializer
    permission_classes = [AllowAny] # Anyone can view a public leaderboard

    def get_queryset(self):
        skill_pk = self.kwargs['skill_pk']
        # Order by highest progress, then highest streak
        return Enrollment.objects.filter(skill_id=skill_pk).order_by('-progress', '-current_streak')
    
    
class GlobalLeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides a ranked list of all users by their total XP.
    Access via /api/leaderboard/
    """
    queryset = Profile.objects.select_related('user').order_by('-total_xp')
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
            skill_id=self.kwargs['skill_pk'],
            parent__isnull=True
        ).select_related('user')

    def perform_create(self, serializer):
        # Automatically associate the comment with the skill from the URL and the logged-in user
        skill = Skill.objects.get(pk=self.kwargs['skill_pk'])
        serializer.save(user=self.request.user, skill=skill)

class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for reviews on a skill.
    Access via /api/skills/{skill_pk}/reviews/
    """
    serializer_class = ReviewSerializer
    permission_classes = [CanReviewSkill, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Review.objects.filter(skill_id=self.kwargs['skill_pk']).select_related('user')

    def perform_create(self, serializer):
        skill = Skill.objects.get(pk=self.kwargs['skill_pk'])
        # Check if the user has already reviewed
        if Review.objects.filter(skill=skill, user=self.request.user).exists():
            raise serializers.ValidationError("You have already reviewed this skill.")
        serializer.save(user=self.request.user, skill=skill)
        
        
class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to list all available tags.
    """
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    permission_classes = [AllowAny]
    
    
class LearningPathViewSet(viewsets.ModelViewSet):
    # MODIFIED: Use our new permission class
    permission_classes = [IsPathOwnerOrReadOnly] 
    queryset = LearningPath.objects.all() # We'll filter this in get_queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return LearningPathDetailSerializer
        # NEW: Use our validation serializer for the manage_skills action
        if self.action == 'manage_skills':
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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        path = self.get_object()
        enrollment, created = PathEnrollment.objects.get_or_create(user=request.user, path=path)
        if created:
            # Auto-enroll in all skills within the path
            for item in path.items.all():
                Enrollment.objects.get_or_create(user=request.user, skill=item.skill)
            enrollment.update_progress()
            return Response({'status': 'enrolled in path successfully'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already enrolled in path'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['put'], permission_classes=[IsPathOwnerOrReadOnly])
    def manage_skills(self, request, pk=None):
        """
        Replaces the entire set of skills for a learning path.
        Expects a PUT request with: { "skill_ids": [1, 5, 2] }
        The skills will be ordered as provided in the list.
        """
        path = self.get_object() # This will be the LearningPath
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        skill_ids = serializer.validated_data['skill_ids']

        try:
            with transaction.atomic():
                # 1. Delete all existing skill items for this path
                path.items.all().delete()
                
                # 2. Create new PathItem objects from the provided list
                new_path_items = [
                    PathItem(path=path, skill_id=skill_id, order=index)
                    for index, skill_id in enumerate(skill_ids)
                ]
                
                # 3. Bulk create them for efficiency
                PathItem.objects.bulk_create(new_path_items)

        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Return the updated learning path
        path_serializer = LearningPathDetailSerializer(path)
        return Response(path_serializer.data, status=status.HTTP_200_OK)

# NEW: ViewSet for a user's Path Enrollments
class PathEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PathEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PathEnrollment.objects.filter(user=self.request.user).select_related('path')
    
    
class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to list all badges earned by the authenticated user.
    Access via /api/my-badges/
    """
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user).select_related('badge', 'badge__skill')
    
    
    
class GlobalSearchAPIView(APIView):
    """
    Provides a global search across Skills and Learning Paths.
    Access via /api/search/?q=<query>
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        query_param = request.query_params.get('q', None)

        if not query_param:
            return Response(
                {"error": "A 'q' query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Search Skills
        skill_results = Skill.objects.filter(
            Q(is_public=True) &  # Must be public
            (
                Q(name__icontains=query_param) |
                Q(description__icontains=query_param) |
                Q(tags__name__icontains=query_param)
            )
        ).distinct()

        # 2. Search Learning Paths
        path_results = LearningPath.objects.filter(
            Q(is_public=True) &  # Must be public
            (
                Q(title__icontains=query_param) |
                Q(description__icontains=query_param)
            )
        ).distinct()

        # 3. Serialize the data
        skill_serializer = SkillSerializer(skill_results, many=True, context={'request': request})
        path_serializer = LearningPathListSerializer(path_results, many=True, context={'request': request})

        # 4. Return the combined, structured response
        return Response({
            'skills': skill_serializer.data,
            'paths': path_serializer.data,
        })