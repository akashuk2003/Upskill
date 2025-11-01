from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Badge, Enrollment, PathEnrollment, Review, Skill, UserBadge

@receiver([post_save, post_delete], sender=Review)
def update_skill_ratings(sender, instance, **kwargs):
    """
    When a review is saved or deleted, trigger the update_ratings method on the skill.
    """
    instance.skill.update_ratings()
    
    
@receiver(post_save, sender=Enrollment)
def update_path_enrollment_progress(sender, instance, **kwargs):
    """
    When a user's progress in a skill changes, check if it affects any learning paths.
    """
    user = instance.user
    skill = instance.skill
    
    # Find all path enrollments for this user that contain this skill
    path_enrollments = PathEnrollment.objects.filter(
        user=user,
        path__items__skill=skill
    )
    
    for enrollment in path_enrollments:
        enrollment.update_progress()
        
        
@receiver(post_save, sender=Skill)
def create_badge_for_skill(sender, instance, created, **kwargs):
    if created:
        # Create a badge with a title based on the skill name
        Badge.objects.create(
            skill=instance,
            title=f"Master of {instance.name}",
            description=f"Awarded for completing the '{instance.name}' skill."
            
        )

@receiver(post_save, sender=Enrollment)
def process_enrollment_update(sender, instance, **kwargs):
    # Part 1: Update path progress (from previous step)
    user = instance.user
    skill = instance.skill
    path_enrollments = PathEnrollment.objects.filter(
        user=user,
        path__items__skill=skill
    )
    for enrollment in path_enrollments:
        enrollment.update_progress()
        
    # Part 2: NEW - Award badge if skill is completed
    if instance.progress == 100:
        try:
            # Find the badge associated with this skill
            badge_to_award = skill.badge
            # Award it to the user, get_or_create handles if they've already earned it
            UserBadge.objects.get_or_create(user=instance.user, badge=badge_to_award)
        except Badge.DoesNotExist:
            # Fails silently if a badge somehow wasn't created for this skill
            pass
        
        
@receiver(post_save, sender=Enrollment)
def award_badge_on_completion(sender, instance, **kwargs):
    """Awards a badge when enrollment progress reaches 100%."""
    if instance.progress == 100:
        try:
            badge_to_award = instance.skill.badge
            UserBadge.objects.get_or_create(user=instance.user, badge=badge_to_award)
        except Badge.DoesNotExist:
            pass