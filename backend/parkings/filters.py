import django_filters

from .models import Parking


class ParkingFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price_per_hour', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price_per_hour', lookup_expr='lte')
    min_capacity = django_filters.NumberFilter(field_name='total_capacity', lookup_expr='gte')

    class Meta:
        model = Parking
        fields = ['city', 'min_price', 'max_price', 'min_capacity']
