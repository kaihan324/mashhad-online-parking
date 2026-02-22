from rest_framework import serializers

from django.utils import timezone



from .models import Reservation



class ReservationSerializer(serializers.ModelSerializer):

    parking_name = serializers.CharField(source='parking.name', read_only=True)

    parking_city = serializers.CharField(source='parking.city', read_only=True)



    class Meta:

        model = Reservation

        fields = '__all__'

        read_only_fields = ('user', 'amount', 'created_at', 'status', 'end_notified', 'is_paid')



    def validate(self, attrs):

        start = attrs.get('start_time')

        end = attrs.get('end_time')

        if start and end and start >= end:

            raise serializers.ValidationError('end_time باید بعد از start_time باشد.')

        if start and start < timezone.now():

            raise serializers.ValidationError('start_time نباید در گذشته باشد.')

        return attrs



    def create(self, validated_data):

        request = self.context.get('request')

        if request and request.user and request.user.is_authenticated:

            validated_data['user'] = request.user



        parking = validated_data['parking']

        duration_hours = (validated_data['end_time'] - validated_data['start_time']).total_seconds() / 3600

        validated_data['amount'] = max(0, int(duration_hours * parking.price_per_hour))



        return super().create(validated_data)

