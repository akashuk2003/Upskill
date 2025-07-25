from django.urls import path, include
from rest_framework_nested import routers
from .views import SkillViewSet, ResourceViewSet, EnrollmentViewSet, LeaderboardViewSet

# Main router for top-level resources
router = routers.DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

# Nested router for leaderboards, which are children of skills
skills_router = routers.NestedDefaultRouter(router, r'skills', lookup='skill')
skills_router.register(r'leaderboard', LeaderboardViewSet, basename='skill-leaderboard')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('', include(skills_router.urls)),
]