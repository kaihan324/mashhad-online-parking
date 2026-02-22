from django.db.models import Avg, Count, Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import serializers

from reservations.models import Reservation

from .models import Parking, ParkingReview


class ParkingSerializer(serializers.ModelSerializer):
    free_capacity = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Parking
        fields = (
            'id',
            'name',
            'city',
            'address',
            'latitude',
            'longitude',
            'image_url',
            'gallery',
            'description',
            'amenities',
            'total_capacity',
            'price_per_hour',
            'manager',
            'free_capacity',
            'avg_rating',
            'review_count',
        )

    def get_free_capacity(self, obj: Parking):
        request = self.context.get('request')
        if not request:
            return None

        start = request.query_params.get('start')
        end = request.query_params.get('end')
        if not start or not end:
            return None

        start_dt = parse_datetime(start)
        end_dt = parse_datetime(end)
        if not start_dt or not end_dt:
            return None

        if timezone.is_naive(start_dt):
            start_dt = timezone.make_aware(start_dt, timezone.get_current_timezone())
        if timezone.is_naive(end_dt):
            end_dt = timezone.make_aware(end_dt, timezone.get_current_timezone())

        overlapping = Reservation.objects.filter(
            parking=obj,
            status__in=[Reservation.STATUS_PENDING, Reservation.STATUS_CONFIRMED],
        ).filter(Q(start_time__lt=end_dt) & Q(end_time__gt=start_dt)).count()

        return max(0, obj.total_capacity - overlapping)

    def get_avg_rating(self, obj: Parking):
        agg = obj.reviews.aggregate(v=Avg('rating'))
        v = agg.get('v')
        return round(float(v), 1) if v is not None else None

    def get_review_count(self, obj: Parking):
        return obj.reviews.aggregate(c=Count('id')).get('c', 0)


class ParkingReviewSerializer(serializers.ModelSerializer):
    user_display = serializers.SerializerMethodField()

    class Meta:
        model = ParkingReview
        fields = (
            'id',
            'parking',
            'user',
            'user_display',
            'rating',
            'title',
            'comment',
            'created_at',
            'admin_reply',
            'replied_at',
        )
        read_only_fields = ('user', 'parking', 'admin_reply', 'replied_at')

    def get_user_display(self, obj: ParkingReview):
        u = obj.user
        if not u:
            return ''
        return u.get_full_name() or u.username


class ParkingReviewCreateSerializer(serializers.Serializer):
    """برای POST در مسیر /api/parkings/{id}/reviews/.

    چون parking از URL مشخص است، از کلاینت نمی‌خواهیم parking را ارسال کند.
    """

    rating = serializers.IntegerField(min_value=1, max_value=5)
    title = serializers.CharField(required=False, allow_blank=True, max_length=120)
    comment = serializers.CharField(allow_blank=False)


class ParkingReviewReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkingReview
        fields = ('admin_reply',)

    def validate_admin_reply(self, v):
        if not v or not str(v).strip():
            raise serializers.ValidationError('پاسخ نمی‌تواند خالی باشد.')
        return v
