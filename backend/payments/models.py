from django.db import models

from django.conf import settings

from reservations.models import Reservation



class PaymentTransaction(models.Model):

    STATUS_PENDING = 'pending'

    STATUS_PAID = 'paid'

    STATUS_FAILED = 'failed'



    STATUS_CHOICES = [

        (STATUS_PENDING, 'Pending'),

        (STATUS_PAID, 'Paid'),

        (STATUS_FAILED, 'Failed'),

    ]



    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')

    reservation = models.OneToOneField(Reservation, on_delete=models.CASCADE, related_name='payment')



    amount = models.PositiveIntegerField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)



    provider = models.CharField(max_length=50, default='mock')

    ref_id = models.CharField(max_length=120, blank=True, null=True)



    created_at = models.DateTimeField(auto_now_add=True)

    paid_at = models.DateTimeField(blank=True, null=True)



    def __str__(self):

        return f"Payment #{self.id} - {self.status} - {self.amount}"

