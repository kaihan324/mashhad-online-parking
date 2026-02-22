from django.utils import timezone

from .models import Reservation

from notifications.models import Notification



def expire_and_notify_for_user(user):

    """Mark ended reservations as expired and create end notifications once."""

    now = timezone.now()

    qs = Reservation.objects.filter(user=user, end_time__lte=now).exclude(status=Reservation.STATUS_CANCELED).select_related('parking')

    for r in qs:

        changed = False

        if r.status in [Reservation.STATUS_PENDING, Reservation.STATUS_CONFIRMED] and r.end_time <= now:

            r.status = Reservation.STATUS_EXPIRED

            changed = True

        if not r.end_notified:

            Notification.objects.create(

                user=user,

                title='پایان رزرو',

                body=f"زمان رزرو شما برای {r.parking.name} به پایان رسید."

            )

            r.end_notified = True

            changed = True

        if changed:

            r.save(update_fields=['status', 'end_notified'])

