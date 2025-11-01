from django_filters import rest_framework as filters
from .models import Skill, Tag

class SkillFilter(filters.FilterSet):
    # Filter by tag names using comma-separated values (e.g., ?tags=python,django)
    tags = filters.ModelMultipleChoiceFilter(
        field_name='tags__name',
        to_field_name='name',
        queryset=Tag.objects.all(),
        conjoined=True # Use AND logic for multiple tags
    )

    class Meta:
        model = Skill
        fields = ['tags']