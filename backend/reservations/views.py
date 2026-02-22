from django.db.models import Q, Count, Sum

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from notifications.models import Notification

from .models import Reservation
from .serializers import ReservationSerializer
from .utils import expire_and_notify_for_user


class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) in ['admin', 'parking_manager']


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().select_related('parking', 'user')
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'parking']
    search_fields = ['car_plate', 'user__username', 'parking__name']
    ordering_fields = ['start_time', 'created_at', 'amount']

    def get_queryset(self):
        user = self.request.user

        if getattr(user, 'role', None) == 'user':
            expire_and_notify_for_user(user)

        if getattr(user, 'role', None) == 'admin':
            return self.queryset
        if getattr(user, 'role', None) == 'parking_manager':
            return self.queryset.filter(parking__manager=user)
        return self.queryset.filter(user=user)

    def get_permissions(self):
        # only admin/manager can modify existing reservations
        if self.action in ['update', 'partial_update', 'destroy', 'approve', 'reject']:
            return [IsAuthenticated(), IsAdminOrManager()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        parking = serializer.validated_data['parking']
        start = serializer.validated_data['start_time']
        end = serializer.validated_data['end_time']

        overlapping = Reservation.objects.filter(
            parking=parking,
            status__in=[Reservation.STATUS_PENDING, Reservation.STATUS_CONFIRMED],
        ).filter(Q(start_time__lt=end) & Q(end_time__gt=start)).count()

        if overlapping >= parking.total_capacity:
            raise ValidationError('ظرفیت این بازه زمانی پر است.')

        reservation = serializer.save(user=self.request.user, status=Reservation.STATUS_PENDING)

        Notification.objects.create(
            user=self.request.user,
            title='ثبت رزرو',
            body=f"رزرو شما برای {parking.name} ثبت شد. برای نهایی شدن پرداخت را انجام دهید."
        )
        return reservation

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        user = request.user

        if reservation.user != user and getattr(user, 'role', None) not in ['admin', 'parking_manager']:
            raise ValidationError('اجازه دسترسی ندارید.')

        if reservation.status == Reservation.STATUS_CANCELED:
            return Response({'detail': 'رزرو قبلاً لغو شده است.'})

        reservation.status = Reservation.STATUS_CANCELED
        reservation.save(update_fields=['status'])

        Notification.objects.create(
            user=reservation.user,
            title='لغو رزرو',
            body=f"رزرو شما برای {reservation.parking.name} لغو شد."
        )

        return Response({'detail': 'رزرو لغو شد.'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin/manager manual approval in special cases."""
        reservation = self.get_object()
        if reservation.status in [Reservation.STATUS_CANCELED, Reservation.STATUS_EXPIRED]:
            raise ValidationError('این رزرو قابل تایید نیست.')

        reservation.status = Reservation.STATUS_CONFIRMED
        reservation.save(update_fields=['status'])

        Notification.objects.create(
            user=reservation.user,
            title='تایید رزرو',
            body=f"رزرو شما برای {reservation.parking.name} تایید شد."
        )
        return Response({'detail': 'رزرو تایید شد.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Admin/manager rejection with optional reason."""
        reservation = self.get_object()
        if reservation.status in [Reservation.STATUS_CANCELED, Reservation.STATUS_EXPIRED]:
            return Response({'detail': 'رزرو قبلاً لغو/منقضی شده است.'})

        reason = (request.data.get('reason') or '').strip()
        reservation.status = Reservation.STATUS_CANCELED
        reservation.save(update_fields=['status'])

        msg = f"رزرو شما برای {reservation.parking.name} لغو شد."
        if reason:
            msg += f" دلیل: {reason}"

        Notification.objects.create(
            user=reservation.user,
            title='رد/لغو رزرو',
            body=msg
        )
        return Response({'detail': 'رزرو رد/لغو شد.'})


class AdminReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', None) != 'admin':
            raise ValidationError('فقط ادمین اجازه دسترسی دارد.')

        total_reservations = Reservation.objects.count()
        total_users = request.user.__class__.objects.count()
        active_users = request.user.__class__.objects.filter(is_active=True).count()

        total_revenue = Reservation.objects.filter(
            status__in=[Reservation.STATUS_CONFIRMED]
        ).aggregate(s=Sum('amount'))['s'] or 0

        by_status = Reservation.objects.values('status').annotate(count=Count('id')).order_by('status')

        return Response({
            'total_reservations': total_reservations,
            'total_users': total_users,
            'active_users': active_users,
            'total_revenue': total_revenue,
            'by_status': list(by_status),
        })
