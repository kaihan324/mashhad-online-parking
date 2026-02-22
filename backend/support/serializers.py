from rest_framework import serializers

from .models import SupportTicket, ContactMessage


class SupportTicketSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = SupportTicket
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'message', 'created_at')
        read_only_fields = ('id', 'created_at')
