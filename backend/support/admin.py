from django.contrib import admin

from .models import SupportTicket, ContactMessage


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'user', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('subject', 'message', 'user__username', 'user__email')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('name', 'email', 'message', 'created_at', 'ip', 'user_agent')

    def has_add_permission(self, request):
        # پیام تماس فقط از طریق سایت ثبت می‌شود.
        return False


# --- UX: اگر هیچ پیام «تماس با ما» ثبت نشده باشد، مدل در صفحه اصلی admin نمایش داده نشود.
# این دقیقاً همان چیزی است که کاربر انتظار دارد: «اگر چیزی نیست، چیزی نشان نده».
_original_get_app_list = admin.site.get_app_list


def _filtered_get_app_list(request):
    app_list = _original_get_app_list(request)
    try:
        if ContactMessage.objects.count() == 0:
            for app in app_list:
                if app.get('app_label') == 'support':
                    app['models'] = [m for m in app.get('models', []) if m.get('object_name') != 'ContactMessage']
            app_list = [a for a in app_list if a.get('models')]
    except Exception:
        # اگر دیتابیس آماده نبود (مثلاً در زمان migrate)، اختلال ایجاد نکن.
        return app_list

    return app_list


admin.site.get_app_list = _filtered_get_app_list
