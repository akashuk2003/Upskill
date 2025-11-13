from django.conf import settings
from django.db import models
from datetime import date, timedelta
from django.db.models import Avg # NEW
from django.core.validators import MinValueValidator, MaxValueValidator # NEW

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Skill(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    average_rating = models.FloatField(default=0.0) # NEW
    review_count = models.IntegerField(default=0)
    tags = models.ManyToManyField(Tag, related_name='skills', blank=True) # NEW

    

    class Meta:
        unique_together = ('name', 'created_by')

    def __str__(self):
        return self.name
    
    def update_ratings(self):
        """Calculates and updates the average rating and review count for the skill."""
        reviews = self.reviews.all()
        self.review_count = reviews.count()
        if self.review_count > 0:
            self.average_rating = reviews.aggregate(Avg('rating'))['rating__avg']
        else:
            self.average_rating = 0.0
        self.save()


class Resource(models.Model):
    TYPE_CHOICES = [
        ('YOUTUBE_VIDEO', 'YouTube Video'),
        ('ARTICLE', 'Article'),
        ('STUDY_MATERIAL', 'Study Material'),
    ]
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=200)
    url = models.URLField()
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='YOUTUBE_VIDEO')
    order = models.PositiveIntegerField(default=0)
    xp = models.PositiveIntegerField(default=10)
    module_title = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 'Module 1: Python Basics'")

    class Meta:
        ordering = ['order']
        unique_together = ('skill', 'order') 

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_on = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0)
    # New fields for streak tracking
    current_streak = models.IntegerField(default=0)
    last_completion_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'skill')

    def __str__(self):
        return f"{self.user.username} enrolled in {self.skill.name}"
    
    def update_progress(self):
        """Calculates and updates the progress percentage."""
        total_resources = self.skill.resources.count()
        if total_resources == 0:
            self.progress = 100
        else:
            completed_resources = self.completions.count()
            self.progress = int((completed_resources / total_resources) * 100)
        self.save()

    def update_streak(self):
        """Updates the user's streak for this enrollment."""
        today = date.today()
        if self.last_completion_date:
            if self.last_completion_date == today:
                # Already completed a resource today, streak doesn't change
                return
            if self.last_completion_date == today - timedelta(days=1):
                # Completed yesterday, so increment streak
                self.current_streak += 1
            else:
                # Missed a day, so reset streak to 1
                self.current_streak = 1
        else:
            # First completion ever for this enrollment
            self.current_streak = 1
        
        self.last_completion_date = today
        self.save()


class ResourceCompletion(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='completions')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    completed_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('enrollment', 'resource')

    def __str__(self):
        return f"{self.enrollment.user.username} completed {self.resource.title}"
    
    
class Comment(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.user.email} on {self.skill.name}'
    
    
class Review(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('skill', 'user') # A user can only review a skill once

    def __str__(self):
        return f'Review by {self.user.email} for {self.skill.name}'
    
    
class LearningPath(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_paths')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

# NEW: Through-model to connect Skills to Paths with an order
class PathItem(models.Model):
    path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='items')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']
        unique_together = ('path', 'skill')

    def __str__(self):
        return f'{self.order}: {self.skill.name} in {self.path.title}'

# NEW: Model to track user enrollment in a Learning Path
class PathEnrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='path_enrollments')
    path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_on = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0) # Percentage completion of the path

    class Meta:
        unique_together = ('user', 'path')

    def __str__(self):
        return f'{self.user.email} enrolled in {self.path.title}'

    def update_progress(self):
        """Calculates progress based on completed skills within the path."""
        path_items = self.path.items.all()
        total_skills_in_path = path_items.count()
        if total_skills_in_path == 0:
            self.progress = 100
            self.save()
            return

        # Find which skills in the path the user has completed
        completed_skills_pks = Enrollment.objects.filter(
            user=self.user,
            skill__in=path_items.values('skill'),
            progress=100
        ).values_list('skill_id', flat=True)

        completed_count = len(completed_skills_pks)
        self.progress = int((completed_count / total_skills_in_path) * 100)
        self.save()
        
        
class Badge(models.Model):
    skill = models.OneToOneField(Skill, on_delete=models.CASCADE, related_name='badge')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=255, blank=True)

    def __str__(self):
        return self.title

class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='earned_by')
    earned_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')
        ordering = ['-earned_on']

    def __str__(self):
        return f'{self.user.email} earned {self.badge.title}'
