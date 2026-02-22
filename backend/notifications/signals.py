from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User
from .models import Notification


@receiver(post_save, sender=User)
def create_welcome_notification(sender, instance: User, created: bool, **kwargs):
    if not created:
        return

    # یک پیام خوش‌آمدگویی واقعی‌نما برای صفحه اعلان‌ها
    Notification.objects.create(
        user=instance,
        title='خوش آمدید 👋',
        body='حساب کاربری شما با موفقیت ایجاد شد. حالا می‌توانید پارکینگ‌های مشهد را ببینید و رزرو انجام دهید.',
    )
