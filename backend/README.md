# Parking Reservation System (Django + Simple Frontend)

## اجرا (Backend)

```bash
python -m venv venv
# فعال سازی venv
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend روی:

- http://localhost:8000/

Admin:

- http://localhost:8000/admin/

## اجرا (Frontend)

داخل پوشه `frontend` یک سرور ساده اجرا کنید:

```bash
cd frontend
python -m http.server 5500
```

سپس در مرورگر:

- http://localhost:5500

## API های مهم

- POST `/api/auth/register/`
- POST `/api/auth/token/`
- GET `/api/auth/me/`
- POST `/api/auth/password-reset/` (ایمیل → در حالت dev داخل ترمینال چاپ می‌شود)
- POST `/api/auth/password-reset-confirm/` (uid, token, new_password)
- GET `/api/parkings/`
- GET `/api/parkings/<id>/availability/?start=...&end=...`
- POST `/api/reservations/`
- POST `/api/reservations/<id>/cancel/`
- POST `/api/payments/initiate/`
- POST `/api/payments/confirm/`
- GET `/api/invoices/<reservation_id>/`
- GET/POST `/api/tickets/` (پشتیبانی)
- GET `/api/reports/summary/` (ادمین)

> پرداخت در این پروژه «Mock» است (برای پروژه دانشگاهی). دکمه پرداخت در فرانت، پرداخت را تایید و رزرو را confirmed می‌کند.
