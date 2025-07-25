from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response

from .models import Skill, Resource, Enrollment, ResourceCompletion
from .serializers import SkillSerializer, ResourceSerializer, EnrollmentSerializer, LeaderboardSerializer

class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

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


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        resource = self.get_object()
        try:
            enrollment = Enrollment.objects.get(user=request.user, skill=resource.skill)
        except Enrollment.DoesNotExist:
            return Response({'error': 'You are not enrolled in this skill.'}, status=status.HTTP_400_BAD_REQUEST)
        
        completion, created = ResourceCompletion.objects.get_or_create(enrollment=enrollment, resource=resource)
        if created:
            # Call our new model methods to update progress AND streak
            enrollment.update_progress()
            enrollment.update_streak()
            return Response({'status': 'resource marked as complete', 'progress': enrollment.progress, 'streak': enrollment.current_streak}, status=status.HTTP_201_CREATED)
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