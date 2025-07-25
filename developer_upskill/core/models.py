from django.conf import settings
from django.db import models
from datetime import date, timedelta

class Skill(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'created_by')

    def __str__(self):
        return self.name


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

    class Meta:
        ordering = ['order']

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