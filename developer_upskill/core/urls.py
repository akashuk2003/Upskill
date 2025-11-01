from django.urls import path, include
from rest_framework_nested import routers
from .views import CommentViewSet, GlobalLeaderboardViewSet, GlobalSearchAPIView, LearningPathViewSet, PathEnrollmentViewSet, ReviewViewSet, SkillViewSet, ResourceViewSet, EnrollmentViewSet, LeaderboardViewSet, TagViewSet, UserBadgeViewSet

# Main router for top-level resources
router = routers.DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'leaderboard', GlobalLeaderboardViewSet, basename='global-leaderboard') # NEW


# Nested router for leaderboards, which are children of skills
skills_router = routers.NestedDefaultRouter(router, r'skills', lookup='skill')
skills_router.register(r'leaderboard', LeaderboardViewSet, basename='skill-leaderboard')
skills_router.register(r'comments', CommentViewSet, basename='skill-comments') 
skills_router.register(r'reviews', ReviewViewSet, basename='skill-reviews') 
router.register(r'my-badges', UserBadgeViewSet, basename='my-badges')

router.register(r'paths', LearningPathViewSet, basename='learningpath') 
router.register(r'path-enrollments', PathEnrollmentViewSet, basename='path-enrollment')
router.register(r'tags', TagViewSet, basename='tag')




# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('', include(skills_router.urls)),
    path('search/', GlobalSearchAPIView.as_view(), name='global-search'),
]