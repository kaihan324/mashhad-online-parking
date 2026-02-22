from django.conf import settings
from django.db import models


class Parking(models.Model):
    name = models.CharField(max_length=150)
    city = models.CharField(max_length=80)
    address = models.TextField()
    total_capacity = models.PositiveIntegerField()
    price_per_hour = models.PositiveIntegerField()

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # NOTE: در این پروژه، برای تصاویر از مسیرهای لوکال داخل فرانت استفاده می‌کنیم
    # مثال: /images/parkings/parking-ferdowsi-university.jpg
    image_url = models.CharField(max_length=300, blank=True, null=True)

    gallery = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, default='')
    amenities = models.JSONField(default=list, blank=True)

    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_parkings',
    )

    def __str__(self):
        return f"{self.name} - {self.city}"


class ParkingReview(models.Model):
    parking = models.ForeignKey(Parking, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='parking_reviews')
    rating = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=120, blank=True, default='')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    admin_reply = models.TextField(blank=True, default='')
    replied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['parking', 'user'], name='uniq_review_per_user_per_parking'),
        ]

    def __str__(self):
        return f"{self.parking_id} - {self.user_id} ({self.rating})"
