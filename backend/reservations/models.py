from django.db import models

from django.conf import settings

from parkings.models import Parking



class Reservation(models.Model):

    STATUS_PENDING = 'pending'

    STATUS_CONFIRMED = 'confirmed'

    STATUS_CANCELED = 'canceled'

    STATUS_EXPIRED = 'expired'



    STATUS_CHOICES = [

        (STATUS_PENDING, 'Pending'),

        (STATUS_CONFIRMED, 'Confirmed'),

        (STATUS_CANCELED, 'Canceled'),

        (STATUS_EXPIRED, 'Expired'),

    ]



    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')

    parking = models.ForeignKey(Parking, on_delete=models.CASCADE, related_name='reservations')



    car_plate = models.CharField(max_length=20)

    start_time = models.DateTimeField()

    end_time = models.DateTimeField()



    amount = models.PositiveIntegerField(default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)





    end_notified = models.BooleanField(default=False)

    is_paid = models.BooleanField(default=False)



    created_at = models.DateTimeField(auto_now_add=True)



    def __str__(self):

        return f"{self.user} - {self.parking} ({self.status})"

