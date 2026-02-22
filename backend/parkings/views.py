from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import BasePermission, IsAuthenticated, AllowAny
from rest_framework.response import Response

from .filters import ParkingFilter
from .models import Parking, ParkingReview
from .serializers import (
    ParkingSerializer,
    ParkingReviewSerializer,
    ParkingReviewCreateSerializer,
    ParkingReviewReplySerializer,
)
from reservations.models import Reservation


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'


class IsParkingManager(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'parking_manager'


class ParkingViewSet(viewsets.ModelViewSet):
    queryset = Parking.objects.all()
    serializer_class = ParkingSerializer

    # Search & filter for the list endpoint
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ParkingFilter
    search_fields = ['name', 'address']
    ordering_fields = ['price_per_hour', 'total_capacity', 'id']
    ordering = ['id']

    def get_queryset(self):
        # پروژه فقط برای شهر مشهد ارائه می‌شود
        qs = Parking.objects.filter(city__iexact='مشهد')

        user = getattr(self.request, 'user', None)
        role = getattr(user, 'role', None) if user and user.is_authenticated else None

        # For manager dashboard: show only their own parkings when mine=1
        mine = (self.request.query_params.get('mine') or '').lower()
        if role == 'parking_manager' and mine in ['1', 'true', 'yes']:
            qs = qs.filter(manager=user)

        # To prevent managers from editing others' parkings
        if role == 'parking_manager' and self.action in ['update', 'partial_update', 'destroy']:
            qs = qs.filter(manager=user)

        return qs

    def get_permissions(self):
        # --- Public (realistic website behavior) ---
        # Guest can browse list & details + check availability + read reviews.
        if self.action in ['list', 'retrieve', 'availability', 'available']:
            return [AllowAny()]

        if self.action == 'reviews':
            # GET => public, POST => authenticated
            if self.request.method == 'GET':
                return [AllowAny()]
            return [IsAuthenticated()]

        # --- Write actions ---
        # create/update/delete: admin OR parking_manager
        if getattr(self.request.user, 'role', None) == 'admin':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated(), IsParkingManager()]

    def perform_create(self, serializer):
        # Ensure parking created by parking_manager is assigned to them.
        user = self.request.user
        if getattr(user, 'role', None) == 'parking_manager':
            serializer.save(manager=user)
        else:
            serializer.save()

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        parking = self.get_object()
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        if not start or not end:
            raise ValidationError('پارامترهای start و end الزامی هستند. (ISO datetime)')

        start_dt = parse_datetime(start)
        end_dt = parse_datetime(end)
        if not start_dt or not end_dt:
            raise ValidationError('فرمت تاریخ/زمان نامعتبر است.')

        if timezone.is_naive(start_dt):
            start_dt = timezone.make_aware(start_dt, timezone.get_current_timezone())
        if timezone.is_naive(end_dt):
            end_dt = timezone.make_aware(end_dt, timezone.get_current_timezone())

        if start_dt >= end_dt:
            raise ValidationError('end باید بعد از start باشد.')

        overlapping = Reservation.objects.filter(
            parking=parking,
            status__in=[Reservation.STATUS_PENDING, Reservation.STATUS_CONFIRMED],
        ).filter(Q(start_time__lt=end_dt) & Q(end_time__gt=start_dt)).count()

        free = max(0, parking.total_capacity - overlapping)

        return Response({
            'parking_id': parking.id,
            'total_capacity': parking.total_capacity,
            'free_capacity': free,
            'start': start_dt,
            'end': end_dt,
        })

    @action(detail=False, methods=['get'])
    def available(self, request):
        """لیست پارکینگ‌های دارای ظرفیت آزاد در یک بازه زمانی.

        Query Params:
          start: ISO datetime
          end: ISO datetime
          min_free: حداقل ظرفیت آزاد (پیش‌فرض 1)

        این endpoint برای صفحه‌ی لیست (فیلتر منطقی) استفاده می‌شود.
        """
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        if not start or not end:
            raise ValidationError('پارامترهای start و end الزامی هستند. (ISO datetime)')

        start_dt = parse_datetime(start)
        end_dt = parse_datetime(end)
        if not start_dt or not end_dt:
            raise ValidationError('فرمت تاریخ/زمان نامعتبر است.')

        if timezone.is_naive(start_dt):
            start_dt = timezone.make_aware(start_dt, timezone.get_current_timezone())
        if timezone.is_naive(end_dt):
            end_dt = timezone.make_aware(end_dt, timezone.get_current_timezone())

        if start_dt >= end_dt:
            raise ValidationError('end باید بعد از start باشد.')

        try:
            min_free = int(request.query_params.get('min_free') or '1')
        except ValueError:
            min_free = 1
        min_free = max(1, min_free)

        # محاسبه‌ی تعداد رزروهای هم‌پوشان برای هر پارکینگ (با query ساده‌تر)
        parkings = list(self.get_queryset())
        out = []
        for p in parkings:
            overlapping = Reservation.objects.filter(
                parking=p,
                status__in=[Reservation.STATUS_PENDING, Reservation.STATUS_CONFIRMED],
            ).filter(Q(start_time__lt=end_dt) & Q(end_time__gt=start_dt)).count()
            free = max(0, p.total_capacity - overlapping)
            if free >= min_free:
                out.append(p)

        ser = ParkingSerializer(out, many=True, context={'request': request})
        return Response(ser.data)

    @action(detail=True, methods=['get', 'post'])
    def reviews(self, request, pk=None):
        """خواندن/ثبت نظر برای یک پارکینگ.

        - GET: عمومی
        - POST: فقط برای کاربران وارد شده.

        منطق ثبت مثل سایت واقعی است:
          هر کاربر برای هر پارکینگ فقط یک Review دارد؛ اگر دوباره ثبت کند، همان Review آپدیت می‌شود.
        """
        parking = self.get_object()

        if request.method == 'GET':
            qs = ParkingReview.objects.filter(parking=parking).select_related('user')
            return Response(ParkingReviewSerializer(qs, many=True).data)

        create_ser = ParkingReviewCreateSerializer(data=request.data)
        create_ser.is_valid(raise_exception=True)

        rating = int(create_ser.validated_data['rating'])
        title = create_ser.validated_data.get('title', '')
        comment = create_ser.validated_data['comment']

        # Upsert: یک Review به ازای هر کاربر
        obj, created = ParkingReview.objects.update_or_create(
            parking=parking,
            user=request.user,
            defaults={
                'rating': rating,
                'title': title,
                'comment': comment,
            },
        )

        return Response(ParkingReviewSerializer(obj).data, status=201 if created else 200)


class ParkingReviewViewSet(viewsets.ModelViewSet):
    queryset = ParkingReview.objects.all().select_related('user', 'parking')
    serializer_class = ParkingReviewSerializer

    def get_permissions(self):
        # read is public (for real website behavior)
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action in ['reply']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        parking_id = request.query_params.get('parking')
        qs = self.get_queryset()
        if parking_id:
            qs = qs.filter(parking_id=parking_id)
        return Response(ParkingReviewSerializer(qs, many=True).data)

    def perform_create(self, serializer):
        # این مسیر فقط برای کاربر وارد شده است
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def reply(self, request, pk=None):
        review = self.get_object()
        ser = ParkingReviewReplySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        review.admin_reply = ser.validated_data['admin_reply']
        review.replied_at = timezone.now()
        review.save(update_fields=['admin_reply', 'replied_at'])
        return Response(ParkingReviewSerializer(review).data)
