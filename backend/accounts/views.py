from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework import generics, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .serializers import (
    RegisterSerializer,
    UserMeSerializer,
    UserMeUpdateSerializer,
    UserAdminSerializer,
)
from .permissions import IsAdmin

User = get_user_model()


class RegisterAPIView(generics.CreateAPIView):
    """Public endpoint to create a new user."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeAPIView(generics.RetrieveUpdateAPIView):
    """Get/Update current user profile."""

    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserMeUpdateSerializer
        return UserMeSerializer


class PasswordResetRequestAPIView(APIView):
    """Sends a reset link to email (dev: printed to console backend)."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        if not email:
            raise ValidationError({'email': 'ایمیل الزامی است.'})
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'اگر این ایمیل ثبت شده باشد، لینک بازیابی ارسال می‌شود.'})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_info = f"uid={uid}&token={token}"
        send_mail(
            subject='Password Reset (Parking System)',
            message=f"برای بازیابی رمز عبور از این اطلاعات استفاده کنید: {reset_info}",
            from_email=None,
            recipient_list=[email],
            fail_silently=True,
        )
        return Response({'detail': 'اگر این ایمیل ثبت شده باشد، لینک بازیابی ارسال می‌شود.'})


class PasswordResetConfirmAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = (request.data.get('uid') or '').strip()
        token = (request.data.get('token') or '').strip()
        new_password = (request.data.get('new_password') or '').strip()

        if not uid or not token or not new_password:
            raise ValidationError('uid، token و new_password الزامی هستند.')

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except Exception:
            raise ValidationError('اطلاعات نامعتبر است.')

        if not default_token_generator.check_token(user, token):
            raise ValidationError('توکن نامعتبر یا منقضی شده است.')

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'رمز عبور با موفقیت تغییر کرد.'})


class UserAdminViewSet(viewsets.ModelViewSet):
    """Admin-only CRUD for users and role assignment."""

    queryset = User.objects.all().order_by('id')
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

