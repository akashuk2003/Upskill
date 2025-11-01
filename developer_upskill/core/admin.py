from django.contrib import admin
from .models import Skill, Resource, Enrollment, ResourceCompletion

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'is_public', 'created_by')
    search_fields = ('name', 'description')
    list_filter = ('is_public',)
    
@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'skill', 'resource_type', 'order')
    search_fields = ('title', 'skill__name')
    list_filter = ('resource_type',)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):    
    list_display = ('user', 'skill', 'enrolled_on', 'progress', 'current_streak')
    search_fields = ('user__username', 'skill__name')
    list_filter = ('skill',)

@admin.register(ResourceCompletion)
class ResourceCompletionAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'resource', 'completed_on')
    search_fields = ('enrollment__user__username', 'resource__title')
    list_filter = ('enrollment__skill',)
