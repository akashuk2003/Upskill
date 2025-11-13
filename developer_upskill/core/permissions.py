
from rest_framework import permissions

from .models import Enrollment

class IsSkillOwnerOrReadOnly(permissions.BasePermission):
    """
    Allows access only to the owner of the skill associated with the resource.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.skill.created_by == request.user
    
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.user == request.user
    
    
class CanReviewSkill(permissions.BasePermission):
    """
    Allows access only to users who have completed the skill.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True # Allow read-only access for anyone
        
        skill_pk = view.kwargs.get('skill_pk')
        if not request.user.is_authenticated:
            return False
            
        return Enrollment.objects.filter(
            user=request.user,
            skill_id=skill_pk,
            progress=100
        ).exists()
        
        
class IsPathOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a Learning Path to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.created_by == request.user