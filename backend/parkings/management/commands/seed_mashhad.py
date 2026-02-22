import random
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from parkings.models import Parking, ParkingReview


PARKINGS = [
    {
        'name': 'پارکینگ طبقاتی آسمان (۱۷ شهریور)',
        'city': 'مشهد',
        'address': 'بلوار ۱۷ شهریور، خیابان شهید حنایی، بین میدان ۱۷ شهریور و حنایی ۲۳',
        'total_capacity': 2100,
        'price_per_hour': 25000,
        'latitude': 36.2923,
        'longitude': 59.6160,
        'image_url': '',
        'amenities': ['دوربین مداربسته', 'نگهبانی ۲۴ ساعته', 'سقف‌دار', 'دستگاه کارت‌خوان'],
        'description': 'پارکینگ بزرگ و پرتردد نزدیک بازار رضا و محدوده ۱۷ شهریور؛ مناسب برای خرید و زیارت.',
    },
    {
        'name': 'پارکینگ طبقاتی رضا (میدان بیت‌المقدس)',
        'city': 'مشهد',
        'address': 'بلوار امام رضا، میدان بیت‌المقدس',
        'total_capacity': 900,
        'price_per_hour': 30000,
        'latitude': 36.2882,
        'longitude': 59.6153,
        'image_url': '',
        'amenities': ['سقف‌دار', 'نزدیک مترو', 'دوربین مداربسته'],
        'description': 'انتخاب مناسب برای دسترسی سریع به حرم مطهر و بازار رضا، با مسیرهای خروجی روان.',
    },
    {
        'name': 'پارکینگ بازار رضا',
        'city': 'مشهد',
        'address': 'عیدگاه (پایین‌خیابان)، میدان شهید حججی، بلوار شهدای حج',
        'total_capacity': 350,
        'price_per_hour': 22000,
        'latitude': 36.2867,
        'longitude': 59.6114,
        'image_url': '',
        'amenities': ['ورود و خروج آسان', 'پرداخت آنلاین', 'نزدیک مراکز خرید'],
        'description': 'برای خرید از بازار رضا گزینه‌ای راحت است؛ زمان انتظار معمولاً کم و دسترسی پیاده عالی است.',
    },
    {
        'name': 'پارکینگ مجتمع الماس شرق (سپاد)',
        'city': 'مشهد',
        'address': 'میدان آتش‌نشان، خیابان بهارستان ۴، مجتمع تجاری الماس شرق',
        'total_capacity': 1300,
        'price_per_hour': 28000,
        'latitude': 36.3727,
        'longitude': 59.6206,
        'image_url': '',
        'amenities': ['سقف‌دار', 'ورودی چندگانه', 'نگهبانی', 'دوربین مداربسته'],
        'description': 'پارکینگ طبقاتی بزرگ برای مراجعه به منطقه گردشگری سپاد و مراکز خرید اطراف.',
    },
    {
        'name': 'پارکینگ پارک ملت',
        'city': 'مشهد',
        'address': 'بلوار وکیل‌آباد، مجاور پارک ملت',
        'total_capacity': 600,
        'price_per_hour': 20000,
        'latitude': 36.3309,
        'longitude': 59.5017,
        'image_url': '',
        'amenities': ['فضای روباز', 'دسترسی آسان', 'مناسب خانواده'],
        'description': 'مناسب برای تفریح در پارک ملت و دسترسی سریع به وکیل‌آباد و مترو پارک ملت.',
    },
    {
        'name': 'پارکینگ کوهسنگی',
        'city': 'مشهد',
        'address': 'بلوار کوهسنگی، ورودی پارک کوهسنگی',
        'total_capacity': 500,
        'price_per_hour': 20000,
        'latitude': 36.3044,
        'longitude': 59.5669,
        'image_url': '',
        'amenities': ['فضای روباز', 'نزدیک جاذبه گردشگری', 'نگهبانی'],
        'description': 'انتخاب محبوب برای بازدید از پارک کوهسنگی؛ مسیرهای دسترسی به بلوار کوهسنگی روان است.',
    },
    {
        'name': 'پارکینگ مجتمع تجاری پروما',
        'city': 'مشهد',
        'address': 'بلوار فردوسی، مجتمع تجاری پروما',
        'total_capacity': 800,
        'price_per_hour': 26000,
        'latitude': 36.3250,
        'longitude': 59.5527,
        'image_url': '',
        'amenities': ['سقف‌دار', 'آسانسور', 'پرداخت آنلاین'],
        'description': 'پارکینگ مناسب برای خرید از پروما و خیابان‌های اطراف با امنیت و دسترسی آسان.',
    },
    {
        'name': 'پارکینگ مجتمع آرمان (نزدیک حرم)',
        'city': 'مشهد',
        'address': 'خیابان نواب صفوی، محدوده مجتمع گردشگری و اقامتی آرمان',
        'total_capacity': 700,
        'price_per_hour': 28000,
        'latitude': 36.2936,
        'longitude': 59.6069,
        'image_url': '',
        'amenities': ['سقف‌دار', 'نزدیک حرم', 'دوربین مداربسته'],
        'description': 'برای زیارت و خرید، یک گزینه نزدیک و پرطرفدار با دسترسی پیاده به محدوده حرم.',
    },
    {
        'name': 'پارکینگ چهارراه دانش',
        'city': 'مشهد',
        'address': 'چهارراه دانش، خیابان امام رضا',
        'total_capacity': 300,
        'price_per_hour': 22000,
        'latitude': 36.2897,
        'longitude': 59.6189,
        'image_url': '',
        'amenities': ['نزدیک مترو', 'ورود و خروج سریع'],
        'description': 'مناسب برای کارهای کوتاه‌مدت در مرکز شهر با دسترسی ساده به خیابان امام رضا.',
    },
    {
        'name': 'پارکینگ احمدآباد',
        'city': 'مشهد',
        'address': 'احمدآباد، خیابان محتشمی، نزدیک مراکز درمانی',
        'total_capacity': 420,
        'price_per_hour': 24000,
        'latitude': 36.3081,
        'longitude': 59.5733,
        'image_url': '',
        'amenities': ['نزدیک مراکز درمانی', 'دوربین مداربسته', 'پرداخت آنلاین'],
        'description': 'برای مراجعه به مطب‌ها و مراکز درمانی احمدآباد، یک انتخاب مطمئن و نزدیک.',
    },
    {
        'name': 'پارکینگ شریعتی',
        'city': 'مشهد',
        'address': 'خیابان شریعتی، نزدیک میدان شریعتی',
        'total_capacity': 280,
        'price_per_hour': 22000,
        'latitude': 36.3089,
        'longitude': 59.5901,
        'image_url': '',
        'amenities': ['نگهبانی', 'دسترسی محلی'],
        'description': 'پارکینگ شهری برای مسیرهای کاری و روزمره در محدوده شریعتی.',
    },
    {
        'name': 'پارکینگ میدان آزادی (فلکه پارک)',
        'city': 'مشهد',
        'address': 'میدان آزادی، نزدیک دانشگاه فردوسی و مسیرهای وکیل‌آباد',
        'total_capacity': 450,
        'price_per_hour': 23000,
        'latitude': 36.3144,
        'longitude': 59.5350,
        'image_url': '',
        'amenities': ['نزدیک دانشگاه', 'نزدیک BRT/مترو', 'پرداخت آنلاین'],
        'description': 'گزینه عالی برای دانشگاه فردوسی و مسیرهای پرتردد میدان آزادی، با دسترسی مناسب.',
    },
]


MORE_NAMES = [
    ('پارکینگ سجاد', 'سجاد، بلوار سجاد، نزدیک مراکز خرید', 450, 24000, 36.3150, 59.5650),
    ('پارکینگ وکیل‌آباد', 'بلوار وکیل‌آباد، نزدیک مترو وکیل‌آباد', 520, 22000, 36.3086, 59.4575),
    ('پارکینگ هفت‌تیر', 'میدان هفت‌تیر، دسترسی به بلوار احمدآباد', 380, 22000, 36.3037, 59.5815),
    ('پارکینگ راه‌آهن', 'میدان راه‌آهن، روبروی ایستگاه راه‌آهن مشهد', 700, 20000, 36.2734, 59.5730),
    ('پارکینگ حرم (زیرگذر نواب صفوی)', 'نواب صفوی، ورودی زیرگذر حرم', 900, 30000, 36.2891, 59.6060),
    ('پارکینگ شیرازی', 'خیابان شیرازی، مسیرهای دسترسی به حرم', 400, 26000, 36.2961, 59.6073),
    ('پارکینگ نواب صفوی ۱۱ (بازار مرکزی)', 'نواب صفوی، نواب ۱۱، کوچه باغ حسن‌خان', 400, 24000, 36.2912, 59.6035),
    ('پارکینگ مجتمع آرمیتاژ گلشن', 'بلوار هفت‌تیر، مجتمع آرمیتاژ گلشن', 650, 30000, 36.3187, 59.5612),
    ('پارکینگ زیست‌خاور', 'بلوار هفت‌تیر، مجتمع زیست‌خاور', 550, 28000, 36.3190, 59.5648),
    ('پارکینگ مرکز خرید آلتون', 'بلوار دانشگاه، مرکز خرید آلتون', 420, 28000, 36.3002, 59.5912),
    ('پارکینگ برج سلمان', 'بلوار معلم، برج سلمان', 500, 28000, 36.3380, 59.5610),
    ('پارکینگ مجتمع توریستی سپاد', 'بزرگراه بابانظر، منطقه سپاد', 900, 25000, 36.3712, 59.6125),
    ('پارکینگ طرقبه (ورودی شهر)', 'طرقبه، مسیر ورودی شهر، نزدیک بازار طرقبه', 600, 20000, 36.3100, 59.3800),
    ('پارکینگ شاندیز (مرکز)', 'شاندیز، مرکز شهر، نزدیک مراکز تفریحی', 500, 20000, 36.3950, 59.3000),
    ('پارکینگ پایانه مسافربری', 'پایانه مسافربری مشهد، ورودی اصلی', 800, 20000, 36.2460, 59.6060),
    ('پارکینگ بیمارستان امام رضا', 'محدوده بیمارستان امام رضا، خیابان ابن‌سینا', 450, 24000, 36.2992, 59.5904),
    ('پارکینگ بیمارستان قائم', 'بلوار وکیل‌آباد، بیمارستان قائم', 500, 24000, 36.3220, 59.5140),
    ('پارکینگ نمایشگاه بین‌المللی', 'بزرگراه آسیایی، نمایشگاه بین‌المللی مشهد', 900, 20000, 36.2570, 59.6760),
    ('پارکینگ پارک وکیل‌آباد', 'پارک وکیل‌آباد، ورودی اصلی', 600, 20000, 36.3510, 59.4190),
    ('پارکینگ میدان جانباز', 'میدان جانباز، دسترسی به بزرگراه‌ها', 450, 22000, 36.3165, 59.5260),
]


NAMES = [
    'علی رضایی', 'محمدحسین موسوی', 'فاطمه احمدی', 'زهرا حسینی', 'مهدی کریمی', 'نرگس محمدی',
    'سارا امینی', 'امیرعلی شریفی', 'حسین مرادی', 'مریم صادقی', 'رضا جعفری', 'الهام کاظمی'
]

COMMENTS = [
    ('تمیز و مرتب', 'پارکینگ تمیز بود و ورود و خروج سریع انجام شد.'),
    ('نزدیک مقصد', 'برای کارهای مرکز شهر عالیه و پیاده‌روی زیادی لازم نیست.'),
    ('امنیت خوب', 'دوربین و نگهبانی داشت و خیالم راحت بود.'),
    ('قیمت مناسب', 'با توجه به موقعیت، قیمتش منطقیه.'),
    ('پیشنهاد می‌کنم', 'تجربه خوبی داشتم و دوباره استفاده می‌کنم.'),
]

ADMIN_REPLIES = [
    'ممنون از ثبت نظر شما. خوشحالیم که تجربه خوبی داشتید 🙏',
    'از بازخورد شما سپاسگزاریم. تلاش می‌کنیم کیفیت همیشه ثابت بماند.',
    'ممنون که وقت گذاشتید. اگر پیشنهادی دارید در پشتیبانی با ما در میان بگذارید.',
]


class Command(BaseCommand):
    help = 'Seed Mashhad parking data + sample users/reviews (demo).'

    def handle(self, *args, **options):
        # Admin
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={'role': 'admin', 'email': 'admin@mashhadparking.ir'},
        )
        if not admin.check_password('admin1234'):
            admin.set_password('admin1234')
            admin.save()

        # Sample users
        users = []
        for i, full in enumerate(NAMES, start=1):
            u, _ = User.objects.get_or_create(
                username=f'user{i}',
                defaults={'email': f'user{i}@example.com', 'first_name': full.split(' ')[0], 'last_name': full.split(' ')[-1]},
            )
            if not u.check_password('user1234'):
                u.set_password('user1234')
                u.save()
            users.append(u)

        created_count = 0
        for p in PARKINGS:
            obj, created = Parking.objects.get_or_create(
                name=p['name'],
                city='مشهد',
                defaults={
                    'address': p['address'],
                    'total_capacity': p['total_capacity'],
                    'price_per_hour': p['price_per_hour'],
                    'latitude': p.get('latitude'),
                    'longitude': p.get('longitude'),
                    'image_url': p.get('image_url'),
                    'gallery': [],
                    'description': p.get('description', ''),
                    'amenities': p.get('amenities', []),
                },
            )
            if created:
                created_count += 1
            # ensure fields updated
            for k in ['address','total_capacity','price_per_hour','latitude','longitude','image_url','description']:
                if k in p and getattr(obj, k) != p[k]:
                    setattr(obj, k, p[k])
            obj.amenities = p.get('amenities', [])
            obj.save()

        # add more
        for name, address, cap, price, lat, lng in MORE_NAMES:
            obj, created = Parking.objects.get_or_create(
                name=name,
                city='مشهد',
                defaults={
                    'address': address,
                    'total_capacity': cap,
                    'price_per_hour': price,
                    'latitude': lat,
                    'longitude': lng,
                    'image_url': '',
                    'gallery': [],
                    'description': 'پارکینگ شهری واقعی‌نما در مشهد با دسترسی مناسب و امکان پرداخت آنلاین.',
                    'amenities': ['پرداخت آنلاین', 'دوربین مداربسته'],
                },
            )
            if created:
                created_count += 1

        # Reviews (3 تا 7 نظر برای هر پارکینگ)
        for parking in Parking.objects.all():
            existing = ParkingReview.objects.filter(parking=parking).count()
            if existing >= 3:
                continue
            n = random.randint(3, 7)
            picks = random.sample(users, k=min(n, len(users)))
            for u in picks:
                title, body = random.choice(COMMENTS)
                rating = random.choice([3, 4, 4, 5])
                r = ParkingReview.objects.create(
                    parking=parking,
                    user=u,
                    rating=rating,
                    title=title,
                    comment=body,
                )
                # یک پاسخ کوتاه ادمین (واقعی‌نما)
                if random.random() < 0.8:
                    r.admin_reply = random.choice(ADMIN_REPLIES)
                    r.replied_at = timezone.now()
                    r.save(update_fields=['admin_reply', 'replied_at'])

        self.stdout.write(self.style.SUCCESS(f'Seed complete. Parkings added/updated: {created_count}. Admin: admin/admin1234'))
