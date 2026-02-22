from django.contrib import admin

from .models import Parking, ParkingReview


class ParkingReviewInline(admin.TabularInline):
    model = ParkingReview
    extra = 0
    readonly_fields = ('user', 'rating', 'title', 'comment', 'created_at', 'replied_at')
    fields = ('user', 'rating', 'title', 'comment', 'created_at', 'admin_reply', 'replied_at')


@admin.register(Parking)
class ParkingAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'total_capacity', 'price_per_hour', 'manager')
    search_fields = ('name', 'city', 'address')
    list_filter = ('city', 'manager')
    inlines = [ParkingReviewInline]


@admin.register(ParkingReview)
class ParkingReviewAdmin(admin.ModelAdmin):
    list_display = ('parking', 'user', 'rating', 'created_at', 'has_reply')
    list_filter = ('rating', 'created_at')
    search_fields = ('parking__name', 'user__username', 'comment', 'admin_reply')

    def has_reply(self, obj: ParkingReview):
        return bool(obj.admin_reply)

    has_reply.boolean = True
    has_reply.short_description = 'پاسخ داده شده'
