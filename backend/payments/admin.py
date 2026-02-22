from django.contrib import admin

from .models import PaymentTransaction



@admin.register(PaymentTransaction)

class PaymentAdmin(admin.ModelAdmin):

    list_display = ('id', 'user', 'reservation', 'amount', 'status', 'created_at', 'paid_at')

    list_filter = ('status', 'provider')

    search_fields = ('ref_id', 'user__username', 'reservation__id')

