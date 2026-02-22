// تصاویر لوکال مرتبط با پارکینگ‌ها (داخل public/images/parkings)
// اگر برای یک پارکینگ image_url در دیتابیس مسیر لوکال داشته باشد، همان استفاده می‌شود.
// در غیر این صورت، با توجه به نام پارکینگ یک تصویر مرتبط انتخاب می‌کنیم و در نهایت fallback لوکال داریم.

const LOCAL_FALLBACKS = [
  '/images/parkings/parking-reza-multi-storey.jpg',
  '/images/parkings/parking-aseman-multi-storey.jpg',
  '/images/parkings/parking-haram-shirazi-entrance.jpg',
  '/images/parkings/parking-railway-station.jpg',
  '/images/parkings/parking-koohsangi.jpg',
  '/images/parkings/parking-alton-mall.jpg'
]

const KEYWORD_MAP = {
  'بازار رضا': '/images/parkings/parking-bazar-reza.jpg',
  'امام رضا': '/images/parkings/parking-imam-reza-hospital.jpg',
  'پایانه': '/images/parkings/parking-imam-reza-terminal.jpg',
  'راه‌آهن': '/images/parkings/parking-railway-station.jpg',
  'فرودگاه': '/images/parkings/parking-hashemi-nejad-airport.jpg',
  'هاشمی': '/images/parkings/parking-hashemi-nejad-airport.jpg',
  'کوهسنگی': '/images/parkings/parking-koohsangi.jpg',
  'فردوسی': '/images/parkings/parking-ferdowsi-university.jpg',
  'پروما': '/images/parkings/parking-proma-ferdowsi.jpg',
  'آسمان': '/images/parkings/parking-aseman-multi-storey.jpg',
  'آلتون': '/images/parkings/parking-alton-mall.jpg',
  'آرمیتاژ': '/images/parkings/parking-armitage-golshan.jpg',
  'زیست‌خاور': '/images/parkings/parking-zist-khavar.jpg',
  'الماس شرق': '/images/parkings/parking-almas-shargh.jpg',
  'نواب': '/images/parkings/parking-navab-safavi.jpg',
  'پاراستار': '/images/parkings/parking-parastar-multi-storey.jpg',
  'خسروی': '/images/parkings/parking-khosravi-public.jpg',
  'قائم': '/images/parkings/parking-qaem-hospital.jpg',
}

export function getParkingImage(parking) {
  const img = parking?.image_url
  if (img && String(img).startsWith('/images/')) return img

  const name = String(parking?.name || '')
  for (const [k, v] of Object.entries(KEYWORD_MAP)) {
    if (name.includes(k)) return v
  }

  const id = Number(parking?.id || 0)
  const idx = Number.isFinite(id) ? Math.abs(id) % LOCAL_FALLBACKS.length : 0
  return LOCAL_FALLBACKS[idx]
}

export { LOCAL_FALLBACKS as PARKING_FALLBACK_IMAGES }
