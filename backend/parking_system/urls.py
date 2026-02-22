from django.contrib import admin

from django.urls import path, include

from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView



from accounts.views import RegisterAPIView, MeAPIView, PasswordResetRequestAPIView, PasswordResetConfirmAPIView, UserAdminViewSet

from parkings.views import ParkingViewSet, ParkingReviewViewSet

from reservations.views import ReservationViewSet, AdminReportView

from notifications.views import NotificationViewSet

from support.views import SupportTicketViewSet, ContactMessageAPIView

from payments.views import InitiatePaymentAPIView, ConfirmPaymentAPIView, InvoiceAPIView, InvoicePDFAPIView



router = DefaultRouter()

router.register(r'parkings', ParkingViewSet, basename='parkings')
router.register(r'reviews', ParkingReviewViewSet, basename='reviews')

router.register(r'reservations', ReservationViewSet, basename='reservations')

router.register(r'notifications', NotificationViewSet, basename='notifications')

router.register(r'tickets', SupportTicketViewSet, basename='tickets')
router.register(r"users", UserAdminViewSet, basename="users")



urlpatterns = [

    path('admin/', admin.site.urls),





    path('api/auth/register/', RegisterAPIView.as_view(), name='register'),

    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/auth/me/', MeAPIView.as_view(), name='me'),

    path('api/auth/password-reset/', PasswordResetRequestAPIView.as_view(), name='password_reset'),

    path('api/auth/password-reset-confirm/', PasswordResetConfirmAPIView.as_view(), name='password_reset_confirm'),





    path('api/payments/initiate/', InitiatePaymentAPIView.as_view(), name='payment_initiate'),

    path('api/payments/confirm/', ConfirmPaymentAPIView.as_view(), name='payment_confirm'),

    path('api/invoices/<int:reservation_id>/', InvoiceAPIView.as_view(), name='invoice'),
    path("api/invoices/<int:reservation_id>/pdf/", InvoicePDFAPIView.as_view(), name="invoice_pdf"),





    path('api/reports/summary/', AdminReportView.as_view(), name='admin_report_summary'),





    path('api/contact/', ContactMessageAPIView.as_view(), name='contact_message'),

    path('api/', include(router.urls)),

]

