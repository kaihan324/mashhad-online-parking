from django.contrib.auth.models import AbstractUser

from django.db import models



class User(AbstractUser):

    ROLE_USER = 'user'

    ROLE_PARKING_MANAGER = 'parking_manager'

    ROLE_ADMIN = 'admin'



    ROLE_CHOICES = [

        (ROLE_USER, 'User'),

        (ROLE_PARKING_MANAGER, 'Parking Manager'),

        (ROLE_ADMIN, 'Admin'),

    ]



    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default=ROLE_USER)





    phone = models.CharField(max_length=20, blank=True, null=True, unique=True)



    def __str__(self):

        return f"{self.username} ({self.role})"

