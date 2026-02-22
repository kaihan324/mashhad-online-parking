from django.contrib import admin

from .models import Reservation



@admin.register(Reservation)

class ReservationAdmin(admin.ModelAdmin):

    list_display = ('id', 'user', 'parking', 'car_plate', 'start_time', 'end_time', 'amount', 'status')

    search_fields = ('car_plate', 'user__username', 'parking__name')

    list_filter = ('status', 'parking__city')

