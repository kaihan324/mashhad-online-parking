from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserMeSerializer(serializers.ModelSerializer):
    """Read serializer for the current authenticated user."""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'role')
        read_only_fields = fields


class UserMeUpdateSerializer(serializers.ModelSerializer):
    """Update serializer for the current authenticated user.

    - role is not editable by the user.
    - phone can be blank and will be normalized to null.
    """

    class Meta:
        model = User
        fields = ('username', 'email', 'phone')

    def validate_phone(self, value):
        if value is None:
            return None
        if str(value).strip() == '':
            return None
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'phone', 'password')

    def validate(self, attrs):
        email = attrs.get('email')
        phone = attrs.get('phone')

        if phone is not None and str(phone).strip() == '':
            attrs['phone'] = None
            phone = None

        if not email and not phone:
            raise serializers.ValidationError('برای ثبت‌نام باید ایمیل یا شماره موبایل وارد شود.')
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.role = User.ROLE_USER
        user.set_password(password)
        user.save()
        return user


class UserAdminSerializer(serializers.ModelSerializer):
    """Admin CRUD serializer for users."""

    password = serializers.CharField(write_only=True, required=False, allow_blank=False, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'role', 'is_active', 'password')

    def validate_phone(self, value):
        if value is None:
            return None
        if str(value).strip() == '':
            return None
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'رمز عبور الزامی است.'})
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
