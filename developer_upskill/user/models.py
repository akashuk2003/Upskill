from django.db import models
from django.contrib.auth.models import AbstractUser,PermissionsMixin

#Registration

class CustomUser(AbstractUser):
    # You can add additional fields here if neede
    name= models.CharField(max_length=255, blank=True)
    email=models.EmailField(unique=True, blank=False)
    is_active=models.BooleanField(default=True)
    is_staff=models.BooleanField(default=False)
    
    USERNAME_FIELD= 'email'
    REQUIRED_FIELDS = ['name']
    
    def __str__(self):
        return self.username
    