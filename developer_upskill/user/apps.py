from django.apps import AppConfig

class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user'

    # MODIFIED: Add this method to import signals
    def ready(self):
        import user.signals