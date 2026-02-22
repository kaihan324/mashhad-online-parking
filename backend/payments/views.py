import uuid
from io import BytesIO

from django.http import FileResponse
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from reservations.models import Reservation
from notifications.models import Notification
from .models import PaymentTransaction


class InitiatePaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        reservation_id = request.data.get('reservation_id')
        if not reservation_id:
            raise ValidationError({'reservation_id': 'رزرو الزامی است.'})

        try:
            reservation = Reservation.objects.select_related('parking').get(id=reservation_id)
        except Reservation.DoesNotExist:
            raise ValidationError('رزرو یافت نشد.')

        if reservation.user != request.user and getattr(request.user, 'role', None) != 'admin':
            raise ValidationError('اجازه دسترسی ندارید.')

        if reservation.status == Reservation.STATUS_CANCELED:
            raise ValidationError('این رزرو لغو شده است.')

        payment, created = PaymentTransaction.objects.get_or_create(
            reservation=reservation,
            defaults={
                'user': reservation.user,
                'amount': reservation.amount,
                'status': PaymentTransaction.STATUS_PENDING,
                'provider': 'mock',
                'ref_id': str(uuid.uuid4()),
            }
        )

        if payment.status == PaymentTransaction.STATUS_PAID:
            return Response({'detail': 'این رزرو قبلاً پرداخت شده است.', 'payment_id': payment.id})

        payment_url = f"/mock-gateway/pay?ref_id={payment.ref_id}"

        return Response({
            'payment_id': payment.id,
            'amount': payment.amount,
            'ref_id': payment.ref_id,
            'payment_url': payment_url,
            'status': payment.status,
        })


class ConfirmPaymentAPIView(APIView):
    """Mock payment confirm: marks payment paid and reservation confirmed."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_id = request.data.get('payment_id')
        if not payment_id:
            raise ValidationError({'payment_id': 'payment_id الزامی است.'})

        try:
            payment = PaymentTransaction.objects.select_related('reservation', 'reservation__parking').get(id=payment_id)
        except PaymentTransaction.DoesNotExist:
            raise ValidationError('پرداخت یافت نشد.')

        reservation = payment.reservation

        if reservation.user != request.user and getattr(request.user, 'role', None) != 'admin':
            raise ValidationError('اجازه دسترسی ندارید.')

        if payment.status == PaymentTransaction.STATUS_PAID:
            return Response({'detail': 'پرداخت قبلاً تایید شده است.'})

        payment.status = PaymentTransaction.STATUS_PAID
        payment.paid_at = timezone.now()
        payment.save(update_fields=['status', 'paid_at'])

        if reservation.status in [Reservation.STATUS_PENDING, Reservation.STATUS_CONFIRMED]:
            reservation.is_paid = True
            reservation.status = Reservation.STATUS_CONFIRMED
            reservation.save(update_fields=['is_paid', 'status'])

        Notification.objects.create(
            user=reservation.user,
            title='پرداخت موفق',
            body=f"پرداخت رزرو شما برای {reservation.parking.name} با موفقیت انجام شد."
        )

        return Response({'detail': 'پرداخت با موفقیت تایید شد.'})


class InvoiceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_reservation(self, request, reservation_id: int):
        try:
            reservation = Reservation.objects.select_related('parking', 'user').get(id=reservation_id)
        except Reservation.DoesNotExist:
            raise ValidationError('رزرو یافت نشد.')

        if reservation.user != request.user and getattr(request.user, 'role', None) != 'admin':
            raise ValidationError('اجازه دسترسی ندارید.')

        return reservation

    def get(self, request, reservation_id: int):
        reservation = self.get_reservation(request, reservation_id)
        payment = getattr(reservation, 'payment', None)

        return Response({
            'reservation': {
                'id': reservation.id,
                'status': reservation.status,
                'is_paid': reservation.is_paid,
                'amount': reservation.amount,
                'car_plate': reservation.car_plate,
                'start_time': reservation.start_time,
                'end_time': reservation.end_time,
                'created_at': reservation.created_at,
            },
            'parking': {
                'id': reservation.parking.id,
                'name': reservation.parking.name,
                'city': reservation.parking.city,
                'address': reservation.parking.address,
                'price_per_hour': reservation.parking.price_per_hour,
            },
            'user': {
                'id': reservation.user.id,
                'username': reservation.user.username,
                'email': reservation.user.email,
                'phone': getattr(reservation.user, 'phone', None),
            },
            'payment': None if not payment else {
                'id': payment.id,
                'status': payment.status,
                'ref_id': payment.ref_id,
                'provider': payment.provider,
                'created_at': payment.created_at,
                'paid_at': payment.paid_at,
            }
        })


class InvoicePDFAPIView(APIView):
    """Return a simple printable PDF invoice for a reservation."""

    permission_classes = [IsAuthenticated]

    def get(self, request, reservation_id: int):
        try:
            reservation = Reservation.objects.select_related('parking', 'user').get(id=reservation_id)
        except Reservation.DoesNotExist:
            raise ValidationError('رزرو یافت نشد.')

        if reservation.user != request.user and getattr(request.user, 'role', None) != 'admin':
            raise ValidationError('اجازه دسترسی ندارید.')

        payment = getattr(reservation, 'payment', None)

        buff = BytesIO()
        c = canvas.Canvas(buff, pagesize=A4)
        width, height = A4

        # Basic layout (English labels to avoid font issues on servers without Persian fonts)
        y = height - 60
        c.setFont('Helvetica-Bold', 16)
        c.drawString(50, y, 'Parking Reservation Invoice')

        y -= 30
        c.setFont('Helvetica', 11)
        c.drawString(50, y, f'Invoice for Reservation #{reservation.id}')

        y -= 30
        c.setFont('Helvetica-Bold', 12)
        c.drawString(50, y, 'Customer')
        y -= 18
        c.setFont('Helvetica', 11)
        c.drawString(50, y, f'Username: {reservation.user.username}')
        y -= 15
        c.drawString(50, y, f'Email: {reservation.user.email or "-"}')
        y -= 15
        c.drawString(50, y, f'Phone: {getattr(reservation.user, "phone", None) or "-"}')

        y -= 25
        c.setFont('Helvetica-Bold', 12)
        c.drawString(50, y, 'Parking')
        y -= 18
        c.setFont('Helvetica', 11)
        c.drawString(50, y, f'Name: {reservation.parking.name}')
        y -= 15
        c.drawString(50, y, f'City: {reservation.parking.city}')
        y -= 15
        c.drawString(50, y, f'Address: {reservation.parking.address}')

        y -= 25
        c.setFont('Helvetica-Bold', 12)
        c.drawString(50, y, 'Reservation')
        y -= 18
        c.setFont('Helvetica', 11)
        c.drawString(50, y, f'Car plate: {reservation.car_plate}')
        y -= 15
        c.drawString(50, y, f'Start: {reservation.start_time}')
        y -= 15
        c.drawString(50, y, f'End: {reservation.end_time}')
        y -= 15
        c.drawString(50, y, f'Status: {reservation.status} | Paid: {"yes" if reservation.is_paid else "no"}')

        y -= 25
        c.setFont('Helvetica-Bold', 12)
        c.drawString(50, y, 'Payment')
        y -= 18
        c.setFont('Helvetica', 11)
        c.drawString(50, y, f'Amount: {reservation.amount} IRR')
        if payment:
            y -= 15
            c.drawString(50, y, f'Provider: {payment.provider} | Ref: {payment.ref_id}')
            y -= 15
            c.drawString(50, y, f'Payment status: {payment.status} | Paid at: {payment.paid_at or "-"}')

        c.showPage()
        c.save()
        buff.seek(0)

        filename = f'invoice_reservation_{reservation.id}.pdf'
        return FileResponse(buff, as_attachment=True, filename=filename, content_type='application/pdf')
