import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-main mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="fw-bold fs-5 mb-2">پارکینگ آنلاین مشهد</div>
            <div className="text-muted">
              رزرو سریع، اطلاعات شفاف و تجربه‌ی ساده برای پیدا کردن جای پارک در مشهد.
            </div>
            <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 mt-3">
              <span className="badge-soft rounded-pill px-3 py-2" dir="ltr">
                051-3700-0000
              </span>
              <span className="badge-soft rounded-pill px-3 py-2" dir="ltr">
                support@mashhadparking.ir
              </span>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <div className="fw-semibold mb-2">لینک‌های سریع</div>
            <div className="d-grid gap-2">
              <a className="footer-link" href="/">خانه</a>
              <a className="footer-link" href="/parkings">پارکینگ‌ها</a>
              <a className="footer-link" href="/support">پشتیبانی</a>
              <a className="footer-link" href="/contact">تماس با ما</a>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <div className="fw-semibold mb-2">راهنمای استفاده</div>
            <div className="d-grid gap-2">
              <a className="footer-link" href="/parkings">
                ۱) انتخاب پارکینگ و مشاهده امتیازها
              </a>
              <a className="footer-link" href="/parkings">
                ۲) رزرو آنلاین و پرداخت
              </a>
              <a className="footer-link" href="/profile">
                ۳) مشاهده رزروها و دریافت فاکتور
              </a>
              <a className="footer-link" href="/notifications">
                ۴) اعلان‌ها و یادآوری‌ها
              </a>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="fw-semibold mb-2">آدرس</div>
            <div className="text-muted">
              مشهد، میدان آزادی، دانشگاه فردوسی مشهد
            </div>
            <div className="ratio ratio-21x9 rounded-4 overflow-hidden border mt-3">
              <iframe
                title="Mashhad"
                src="https://www.openstreetmap.org/export/embed.html?bbox=59.5000%2C36.2700%2C59.6200%2C36.3500&layer=mapnik&marker=36.3106%2C59.5350"
              />
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div className="text-muted">© {year} Mashhad Online Parking</div>
          <div className="text-muted">
            نسخه ۱.۰ | مرکز خدمات پارکینگ مشهد
          </div>
        </div>
      </div>
    </footer>
  );
}
