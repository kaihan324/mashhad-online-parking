from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from accounts.models import User
from reservations.utils import expire_and_notify_for_user

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        expire_and_notify_for_user(self.request.user)
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def broadcast(self, request):
        """Admin-only: send a notification to all active users."""

        title = (request.data.get('title') or '').strip()
        body = (request.data.get('body') or '').strip()
        if not title or not body:
            raise ValidationError({'detail': 'title و body الزامی هستند.'})

        users = User.objects.filter(is_active=True)
        Notification.objects.bulk_create(
            [Notification(user=u, title=title, body=body) for u in users]
        )
        return Response({'detail': 'اعلان برای همه کاربران فعال ارسال شد.', 'count': users.count()})
