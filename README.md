# Mashhad Online Parking — Full‑Stack Parking Reservation System

A full‑stack **parking reservation & management** web app built with **Django REST Framework** (Back‑End) and **React + Vite** (Front‑End).

It supports **JWT authentication (access/refresh)**, **role‑based panels** (Admin / Parking Manager / User), **availability checking with overlap + capacity control**, **mock payments**, and **invoice generation (JSON + PDF)**.

> This repository is an academic/demo project focused on a real‑world workflow for the city of **Mashhad**.

---

## Features

### Authentication & Accounts
- Register / Login with **JWT (SimpleJWT)**
- Refresh token flow (front‑end auto refresh on `401`)
- Profile endpoint (**/api/auth/me/**)
- Password reset flow (dev mode: reset info printed to server console)

### Parking Discovery
- Parking list + details
- Search, filter, ordering (price, capacity, …)
- **Availability check** for a given time range
- Optional endpoint to list parkings that have free capacity in a range

### Reservations
- Create reservation
- **Capacity + overlap protection** (prevents overbooking)
- Cancel reservation (user/admin/manager)
- Manual approve/reject (admin/manager)
- Auto‑expire ended reservations + end notification

### Payments & Invoices
- **Mock payment gateway** (initiate + confirm)
- Invoice endpoint (JSON)
- Downloadable **PDF invoice** (ReportLab)

### Notifications & Support
- Personal notifications for key events
- Admin broadcast notification to all active users
- Support tickets (user creates, admin can manage)
- Public contact form endpoint (admin can view messages)

---

## Tech Stack

**Back‑End**
- Django 4.2+
- Django REST Framework
- SimpleJWT (access/refresh)
- django-filter
- django-cors-headers
- ReportLab (PDF invoices)
- SQLite (default)

**Front‑End**
- React 18
- Vite
- React Router
- Axios
- Bootstrap 5

---

## Roles & Permissions

- **user**
  - Browse parkings, check availability
  - Create/cancel reservations (own)
  - Mock payment + invoices
  - Notifications, reviews, support tickets

- **parking_manager**
  - Create/update/delete **own** parkings
  - View/cancel reservations related to **own** parkings

- **admin**
  - Full CRUD on users (including role assignment)
  - Reports summary
  - Manage all parkings/reservations
  - Broadcast notifications
  - Reply to reviews

---

## Project Structure

```text
repo-root/
  backend/                 # Django + DRF API
  frontend/                # React + Vite UI
  README.md                # (put this file here)
```

---

## Getting Started (Local)

### Prerequisites
- Python 3.10+ (recommended)
- Node.js 18+

### 1) Back‑End

```bash
cd backend
python -m venv .venv
# Windows:
#   .venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Back‑End URLs:
- API base: `http://127.0.0.1:8000/api/`
- Admin panel: `http://127.0.0.1:8000/admin/`

> **Note:** For simplicity this project uses SQLite and has `DEBUG=True` and open CORS in `backend/parking_system/settings.py`.

### 2) Front‑End

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Front‑End URL:
- `http://127.0.0.1:5173/`

Environment variable:
- `VITE_API_BASE=http://localhost:8000`

---

## Seed Demo Data (Optional)

You can generate demo users + sample parkings + reviews:

```bash
cd backend
source .venv/bin/activate
python manage.py seed
```

Demo credentials created by `seed`:
- **Admin:** `admin` / `Admin12345!`
- **Manager:** `manager` / `Manager12345!`
- **User:** `user` / `User12345!`

There is also an extended Mashhad dataset:

```bash
python manage.py seed_mashhad
```

It creates:
- **Admin:** `admin` / `admin1234`
- **Users:** `user1..user12` / `user1234`

---

## API Overview

### Auth
- `POST /api/auth/register/`
- `POST /api/auth/token/`
- `POST /api/auth/refresh/`
- `GET/PATCH /api/auth/me/`
- `POST /api/auth/password-reset/` (dev: printed in server console)
- `POST /api/auth/password-reset-confirm/` (uid, token, new_password)

### Parkings
- `GET /api/parkings/` (search/filter/order)
- `GET /api/parkings/{id}/`
- `GET /api/parkings/{id}/availability/?start=...&end=...`
- `GET /api/parkings/available/?start=...&end=...&min_free=1`
- `GET/POST /api/parkings/{id}/reviews/`

### Reservations
- `GET/POST /api/reservations/`
- `POST /api/reservations/{id}/cancel/`
- `POST /api/reservations/{id}/approve/` (admin/manager)
- `POST /api/reservations/{id}/reject/` (admin/manager)

### Payments & Invoices
- `POST /api/payments/initiate/`
- `POST /api/payments/confirm/`
- `GET /api/invoices/{reservation_id}/` (JSON)
- `GET /api/invoices/{reservation_id}/pdf/` (PDF)

### Notifications
- `GET /api/notifications/`
- `POST /api/notifications/broadcast/` (admin)

### Support & Contact
- `GET/POST /api/tickets/`
- `GET/POST /api/contact/` (GET is admin‑only)

### Reports
- `GET /api/reports/summary/` (admin)

---

## Front‑End Pages (Routes)

Public:
- `/` Home
- `/parkings` Parking list
- `/parkings/:id` Parking details
- `/contact` Contact form
- `/support` Support page

Auth only:
- `/profile` Profile + reservations
- `/notifications` Notifications
- `/payment/:reservationId` Mock payment
- `/invoice/:reservationId` Invoice (JSON + PDF download)

Role panels:
- `/admin` Admin dashboard
- `/manager` Parking manager dashboard

---

## Testing

Step‑by‑step testing scenarios are available in:
- `backend/TESTING.md`
- `frontend/TESTING.md`

---

## Notes

- Parkings are filtered to the city **Mashhad** in `backend/parkings/views.py` for demo purposes.
- For production use, move secrets/config out of `settings.py` and into environment variables.

---

## License

No license is specified (educational project). Add a license file if you plan to publish/redistribute.
