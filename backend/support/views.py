from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

from .models import SupportTicket, ContactMessage
from .serializers import SupportTicketSerializer, ContactMessageSerializer


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'


class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOnly()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'admin':
            return SupportTicket.objects.all().order_by('-created_at')
        return SupportTicket.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ContactMessageAPIView(APIView):
    """POST: ثبت پیام تماس (برای همه)
    GET: لیست پیام‌ها (فقط ادمین)

    این دقیقاً چیزی است که برای «سایت واقعی» انتظار می‌رود.
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAdminOnly()]
        return [AllowAny()]

    def post(self, request):
        ser = ContactMessageSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        # ذخیره metadata ساده
        ip = request.META.get('REMOTE_ADDR')
        ua = (request.META.get('HTTP_USER_AGENT') or '')[:300]

        obj = ContactMessage.objects.create(
            name=ser.validated_data['name'],
            email=ser.validated_data['email'],
            message=ser.validated_data['message'],
            ip=ip,
            user_agent=ua,
        )

        return Response(ContactMessageSerializer(obj).data, status=status.HTTP_201_CREATED)

    def get(self, request):
        qs = ContactMessage.objects.all().order_by('-created_at')
        return Response(ContactMessageSerializer(qs, many=True).data)
