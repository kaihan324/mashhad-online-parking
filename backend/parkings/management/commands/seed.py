import random

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from parkings.models import Parking, ParkingReview


class Command(BaseCommand):
    def handle(self, *args, **options):
        User = get_user_model()

        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={'email': 'admin@example.com', 'role': User.ROLE_ADMIN, 'is_staff': True, 'is_superuser': True},
        )
        admin.role = User.ROLE_ADMIN
        admin.is_staff = True
        admin.is_superuser = True
        admin.set_password('Admin12345!')
        admin.save()

        manager, _ = User.objects.get_or_create(
            username='manager',
            defaults={'email': 'manager@example.com', 'role': User.ROLE_PARKING_MANAGER},
        )
        manager.role = User.ROLE_PARKING_MANAGER
        manager.set_password('Manager12345!')
        manager.save()

        user, _ = User.objects.get_or_create(
            username='user',
            defaults={'email': 'user@example.com', 'role': User.ROLE_USER},
        )
        user.role = User.ROLE_USER
        user.set_password('User12345!')
        user.save()

        # چند کاربر واقعی‌نما برای ثبت نظر (نام‌های فارسی)
        reviewer_specs = [
            ('ali.rezaei', 'علی', 'رضایی'),
            ('sara.ahmadi', 'سارا', 'احمدی'),
            ('mohammad.kazemi', 'محمد', 'کاظمی'),
            ('fatemeh.mousavi', 'فاطمه', 'موسوی'),
            ('reza.hosseini', 'رضا', 'حسینی'),
            ('narges.karimi', 'نرگس', 'کریمی'),
            ('amir.moradi', 'امیر', 'مرادی'),
            ('zahra.jafari', 'زهرا', 'جعفری'),
            ('mahdi.soltani', 'مهدی', 'سلطانی'),
            ('elham.nouri', 'الهام', 'نوری'),
            ('hossein.fallah', 'حسین', 'فلاح'),
            ('mina.sharifi', 'مینا', 'شریفی'),
        ]
        reviewers = []
        for uname, first, last in reviewer_specs:
            u, _ = User.objects.get_or_create(
                username=uname,
                defaults={'email': f'{uname}@example.com', 'role': User.ROLE_USER, 'first_name': first, 'last_name': last},
            )
            u.role = User.ROLE_USER
            u.first_name = first
            u.last_name = last
            u.set_password('User12345!')
            u.save()
            reviewers.append(u)

        data = [
            {
                'name': 'پارکینگ طبقاتی رضا',
                'city': 'مشهد',
                'address': 'مشهد، خیابان امام رضا، میدان بیت‌المقدس (فلکه آب)، جنب بازار رضا',
                'latitude': 36.287900,
                'longitude': 59.615700,
                'total_capacity': 900,
                'price_per_hour': 25000,
                'image_url': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1481886756534-97af88ccb438?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
                ],
                'amenities': ['دوربین مداربسته', 'نگهبانی ۲۴ ساعته', 'سرویس بهداشتی', 'ورودی/خروجی مجزا'],
                'description': 'این پارکینگ در محور پرتردد امام رضا قرار دارد و برای خرید از بازار رضا و دسترسی به حرم مطهر گزینه‌ای مناسب است. مسیرهای پیاده‌رو، روشنایی مناسب و ظرفیت بالا باعث می‌شود در ساعات شلوغ هم سریع‌تر جای پارک پیدا کنید.',
            },
            {
                'name': 'پارکینگ طبقاتی آسمان',
                'city': 'مشهد',
                'address': 'مشهد، خیابان ۱۷ شهریور، نزدیک چهارراه عنصری، دسترسی سریع به مراکز خرید',
                'latitude': 36.289600,
                'longitude': 59.607900,
                'total_capacity': 700,
                'price_per_hour': 22000,
                'image_url': 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
                ],
                'amenities': ['پوشش سقف', 'نگهبانی', 'کارت‌خوان', 'دسترسی آسان به مترو'],
                'description': 'مناسب برای رفت‌وآمدهای روزانه و خرید در محدوده ۱۷ شهریور. دسترسی به مسیرهای اصلی شهر و امکان پارک طولانی‌مدت، این پارکینگ را به انتخابی مطمئن تبدیل کرده است.',
            },
            {
                'name': 'پارکینگ عمومی خسروی',
                'city': 'مشهد',
                'address': 'مشهد، خیابان خسروی نو، نزدیک چهارراه شهدا، دسترسی مناسب به مراکز اداری',
                'latitude': 36.292400,
                'longitude': 59.613500,
                'total_capacity': 520,
                'price_per_hour': 20000,
                'image_url': 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
                ],
                'amenities': ['دوربین', 'روشنایی شب', 'خروج اضطراری', 'پذیرش خودروهای بزرگ'],
                'description': 'پارکینگ خسروی در قلب شهر و نزدیک بافت تاریخی قرار دارد. اگر کار اداری یا خرید در محدوده مرکزی دارید، این پارکینگ انتخاب خوبی است و معمولاً در طول روز رفت‌وآمد روانی دارد.',
            },
            {
                'name': 'پارکینگ طبقاتی پرستار',
                'city': 'مشهد',
                'address': 'مشهد، بلوار احمدآباد، خیابان پرستار ۳، نزدیک مراکز درمانی و اداری',
                'latitude': 36.312700,
                'longitude': 59.554900,
                'total_capacity': 420,
                'price_per_hour': 24000,
                'image_url': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1520962917965-5f1f5f5f3c17?auto=format&fit=crop&w=1200&q=80',
                ],
                'amenities': ['نزدیک ایستگاه اتوبوس', 'پوشش سقف', 'پله‌برقی', 'سرویس بهداشتی'],
                'description': 'این پارکینگ برای مراجعه به مراکز درمانی و ساختمان‌های اداری احمدآباد بسیار مناسب است. مسیر ورود و خروج مشخص، ترافیک داخلی کم و امنیت خوب از مزیت‌های این مجموعه است.',
            },
            {
                'name': 'پارکینگ حرم - ورودی شیرازی',
                'city': 'مشهد',
                'address': 'مشهد، خیابان شیرازی، ورودی زیرگذر، دسترسی سریع به صحن‌های حرم مطهر',
                'latitude': 36.287000,
                'longitude': 59.615000,
                'total_capacity': 1000,
                'price_per_hour': 28000,
                'image_url': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
                ],
                'amenities': ['پرسنل راهنما', 'نگهبانی ۲۴ ساعته', 'دوربین', 'تردد آسان'],
                'description': 'برای زیارت و تردد سریع به محدوده حرم مطهر، این پارکینگ یکی از بهترین گزینه‌هاست. در روزهای پرتردد، سیستم هدایت خودرو و راهنمایی پرسنل باعث کاهش زمان جستجوی جای پارک می‌شود.',
            },
            {
                'name': 'پارکینگ نواب صفوی',
                'city': 'مشهد',
                'address': 'مشهد، خیابان نواب صفوی، نزدیک میدان طبرسی، مناسب دسترسی به بازار و اقامتگاه‌ها',
                'latitude': 36.289000,
                'longitude': 59.617200,
                'total_capacity': 460,
                'price_per_hour': 23000,
                'image_url': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
                ],
                'amenities': ['دسترسی آسان به بازار', 'روشنایی', 'پوشش سقف', 'سرویس بهداشتی'],
                'description': 'مناسب برای اقامت در اطراف نواب صفوی و خرید از بازارهای نزدیک. مسیرهای رفت‌وآمد واضح و فضای مانور مناسب، پارک کردن را آسان‌تر می‌کند.',
            },
            {
                'name': 'پارکینگ ملت (نمایشگاه)',
                'city': 'مشهد',
                'address': 'مشهد، بلوار وکیل‌آباد، حوالی پارک ملت و نمایشگاه بین‌المللی',
                'latitude': 36.310300,
                'longitude': 59.529900,
                'total_capacity': 650,
                'price_per_hour': 21000,
                'image_url': 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80',
                'gallery': [
                    'https://images.unsplash.com/photo-1517148815978-75f6acaaf32c?auto=format&fit=crop&w=1200&q=80',
                ],
                'amenities': ['محوطه بزرگ', 'دسترسی مترو', 'نگهبانی', 'مناسب همایش‌ها'],
                'description': 'در روزهای برگزاری نمایشگاه و رویدادهای پارک ملت، این پارکینگ به‌خاطر ظرفیت مناسب و دسترسی عالی به وکیل‌آباد بسیار پرکاربرد است.',
            },
	            {
	                'name': 'پارکینگ مجتمع الماس شرق',
	                'city': 'مشهد',
	                'address': 'مشهد، بلوار خیام شمالی، بلوار بهارستان، بهارستان ۴، مجتمع تجاری الماس شرق',
	                'latitude': 36.355200,
	                'longitude': 59.629000,
	                'total_capacity': 1300,
	                'price_per_hour': 22000,
	                'image_url': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1517148815978-75f6acaaf32c?auto=format&fit=crop&w=1200&q=80',
	                    'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['پارکینگ طبقاتی', 'نگهبانی', 'دوربین', 'دسترسی آسان به مجتمع خرید'],
	                'description': 'پارکینگ طبقاتی الماس شرق با ظرفیت بالا برای خرید و گردش در محدوده سپاد بسیار مناسب است. ورودی واضح و مسیرهای داخلی مشخص، پارک کردن را سریع‌تر می‌کند.',
	            },
	            {
	                'name': 'پارکینگ پروما (بلوار فردوسی)',
	                'city': 'مشهد',
	                'address': 'مشهد، بلوار فردوسی، مرکز خرید پروما، ورودی پارکینگ مجتمع',
	                'latitude': 36.320800,
	                'longitude': 59.561300,
	                'total_capacity': 900,
	                'price_per_hour': 23000,
	                'image_url': 'https://images.unsplash.com/photo-1511910849309-0f0a72f67a21?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['سقف‌دار', 'کارت‌خوان', 'نگهبانی', 'مناسب خرید'],
	                'description': 'برای خرید از پروما و تردد در محور فردوسی، این پارکینگ گزینه‌ای راحت و امن است. دسترسی به خیابان‌های اصلی و روشنایی مناسب از مزیت‌های آن است.',
	            },
	            {
	                'name': 'پارکینگ آرمیتاژ گلشن',
	                'city': 'مشهد',
	                'address': 'مشهد، بلوار هفت تیر، مجتمع آرمیتاژ گلشن، ورودی پارکینگ',
	                'latitude': 36.327200,
	                'longitude': 59.535900,
	                'total_capacity': 800,
	                'price_per_hour': 26000,
	                'image_url': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['پوشش سقف', 'نگهبانی', 'دوربین', 'دسترسی آسان به مرکز خرید'],
	                'description': 'پارکینگ مجتمع آرمیتاژ گلشن به‌خاطر مسیرهای ورودی و خروجی استاندارد و امنیت مناسب، برای خرید و کارهای روزمره در محدوده هفت‌تیر انتخاب خوبی است.',
	            },
	            {
	                'name': 'پارکینگ مرکز خرید آلتون',
	                'city': 'مشهد',
	                'address': 'مشهد، بلوار معلم، مرکز خرید آلتون، پارکینگ طبقاتی مجتمع',
	                'latitude': 36.329000,
	                'longitude': 59.522800,
	                'total_capacity': 600,
	                'price_per_hour': 25000,
	                'image_url': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['سقف‌دار', 'آسانسور', 'روشنایی', 'دوربین'],
	                'description': 'اگر مقصد شما مرکز خرید آلتون و محدوده معلم است، این پارکینگ با ظرفیت مناسب و دسترسی مستقیم به مجتمع، گزینه‌ای راحت و بی‌دردسر است.',
	            },
	            {
	                'name': 'پارکینگ زیست‌خاور',
	                'city': 'مشهد',
	                'address': 'مشهد، خیابان امام رضا، نزدیک چهارراه دانش، مجتمع زیست‌خاور',
	                'latitude': 36.291300,
	                'longitude': 59.604800,
	                'total_capacity': 550,
	                'price_per_hour': 24000,
	                'image_url': 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['سقف‌دار', 'نگهبانی', 'کارت‌خوان', 'نزدیک حرم'],
	                'description': 'برای خرید و تردد در محور امام رضا و نزدیکی چهارراه دانش، پارکینگ زیست‌خاور انتخابی مطمئن است و معمولاً نظم داخلی خوبی دارد.',
	            },
	            {
	                'name': 'پارکینگ بازار رضا',
	                'city': 'مشهد',
	                'address': 'مشهد، عیدگاه (پایین خیابان)، میدان شهید حججی، بلوار شهدای حج',
	                'latitude': 36.284900,
	                'longitude': 59.608700,
	                'total_capacity': 450,
	                'price_per_hour': 21000,
	                'image_url': 'https://images.unsplash.com/photo-1481886756534-97af88ccb438?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['نزدیک بازار', 'روشنایی', 'نگهبانی', 'دسترسی پیاده به حرم'],
	                'description': 'برای خرید از بازار رضا و محدوده عیدگاه، این پارکینگ دسترسی کوتاه و مسیرهای خروجی متنوع دارد و زمان رسیدن به مقصد را کم می‌کند.',
	            },
	            {
	                'name': 'پارکینگ کوهسنگی',
	                'city': 'مشهد',
	                'address': 'مشهد، بلوار کوهسنگی، نزدیک ورودی پارک کوهسنگی',
	                'latitude': 36.297700,
	                'longitude': 59.566300,
	                'total_capacity': 700,
	                'price_per_hour': 20000,
	                'image_url': 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['محوطه بزرگ', 'روشنایی', 'نگهبانی', 'مناسب تفریح'],
	                'description': 'برای تفریح در پارک کوهسنگی و اطراف آن، این پارکینگ با ظرفیت مناسب و دسترسی آسان، استرس پیدا کردن جای پارک را کاهش می‌دهد.',
	            },
	            {
	                'name': 'پارکینگ ایستگاه راه‌آهن',
	                'city': 'مشهد',
	                'address': 'مشهد، میدان راه‌آهن، محوطه پارکینگ ایستگاه راه‌آهن',
	                'latitude': 36.286100,
	                'longitude': 59.603200,
	                'total_capacity': 800,
	                'price_per_hour': 18000,
	                'image_url': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['نگهبانی', 'دوربین', 'دسترسی سریع به ترمینال', 'ورودی/خروجی مشخص'],
	                'description': 'برای مسافران و بدرقه‌کنندگان، پارکینگ راه‌آهن با دسترسی مستقیم و ظرفیت بالا، گزینه‌ای کاربردی و سریع است.',
	            },
	            {
	                'name': 'پارکینگ فرودگاه شهید هاشمی‌نژاد',
	                'city': 'مشهد',
	                'address': 'مشهد، فرودگاه بین‌المللی شهید هاشمی‌نژاد، پارکینگ عمومی فرودگاه',
	                'latitude': 36.234000,
	                'longitude': 59.640000,
	                'total_capacity': 1200,
	                'price_per_hour': 30000,
	                'image_url': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['نگهبانی', 'پرداخت الکترونیک', 'دوربین', 'پارک طولانی‌مدت'],
	                'description': 'پارکینگ فرودگاه برای توقف‌های کوتاه و بلندمدت طراحی شده و مسیرهای ورود/خروج آن برای کاهش معطلی بهینه است.',
	            },
	            {
	                'name': 'پارکینگ بیمارستان امام رضا (ع)',
	                'city': 'مشهد',
	                'address': 'مشهد، میدان ۱۵ خرداد، بیمارستان امام رضا (ع)، پارکینگ مراجعین',
	                'latitude': 36.296000,
	                'longitude': 59.602000,
	                'total_capacity': 450,
	                'price_per_hour': 19000,
	                'image_url': 'https://images.unsplash.com/photo-1520962917965-5f1f5f5f3c17?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['نزدیک ورودی بیمارستان', 'روشنایی', 'نگهبانی', 'مسیرهای مشخص'],
	                'description': 'برای مراجعه به بیمارستان امام رضا (ع)، این پارکینگ به‌خاطر نزدیکی به ورودی و نظم داخلی، وقت شما را حفظ می‌کند.',
	            },
	            {
	                'name': 'پارکینگ بیمارستان قائم (عج)',
	                'city': 'مشهد',
	                'address': 'مشهد، احمدآباد، بیمارستان قائم (عج)، پارکینگ مراجعین',
	                'latitude': 36.312000,
	                'longitude': 59.551800,
	                'total_capacity': 500,
	                'price_per_hour': 19000,
	                'image_url': 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1511910849309-0f0a72f67a21?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['نگهبانی', 'روشنایی', 'مسیر ورودی/خروجی مشخص', 'دسترسی سریع'],
	                'description': 'در محدوده پرتردد احمدآباد، پارکینگ بیمارستان قائم کمک می‌کند بدون دور زدن‌های زیاد، جای پارک مناسب پیدا کنید.',
	            },
	            {
	                'name': 'پارکینگ دانشگاه فردوسی',
	                'city': 'مشهد',
	                'address': 'مشهد، میدان آزادی، دانشگاه فردوسی مشهد، ورودی اصلی',
	                'latitude': 36.310560,
	                'longitude': 59.535000,
	                'total_capacity': 650,
	                'price_per_hour': 15000,
	                'image_url': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['محوطه بزرگ', 'نگهبانی', 'دوربین', 'دسترسی آسان به میدان آزادی'],
	                'description': 'پارکینگ دانشگاه فردوسی در محدوده میدان آزادی قرار دارد و برای مراجعات اداری/دانشجویی و تردد در محور وکیل‌آباد گزینه‌ای منطقی است.',
	            },
	            {
	                'name': 'پارکینگ پایانه مسافربری امام رضا',
	                'city': 'مشهد',
	                'address': 'مشهد، پایانه امام رضا، محوطه پارکینگ مسافربری',
	                'latitude': 36.255700,
	                'longitude': 59.604900,
	                'total_capacity': 900,
	                'price_per_hour': 18000,
	                'image_url': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
	                'gallery': [
	                    'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=80',
	                ],
	                'amenities': ['نگهبانی', 'دسترسی مستقیم به پایانه', 'پرداخت الکترونیک', 'فضای مانور مناسب'],
	                'description': 'برای سفرهای بین‌شهری و توقف‌های کوتاه، این پارکینگ به‌خاطر دسترسی مستقیم و ظرفیت بالا، انتخابی راحت است.',
	            },
        ]

        # --- نگاشت عکس‌های لوکال (فرانت) بر اساس نام پارکینگ ---
        # تصاویر داخل frontend/public/images/parkings/ قرار دارند.
        LOCAL_IMAGES = {
            'آسمان': '/images/parkings/parking-aseman-multi-storey.jpg',
            'طبقاتی رضا': '/images/parkings/parking-reza-multi-storey.jpg',
            'بازار رضا': '/images/parkings/parking-bazar-reza.jpg',
            'خسروی': '/images/parkings/parking-khosravi-public.jpg',
            'پرستار': '/images/parkings/parking-parastar-multi-storey.jpg',
            'حرم': '/images/parkings/parking-haram-shirazi-entrance.jpg',
            'نواب صفوی': '/images/parkings/parking-navab-safavi.jpg',
            'ملت': '/images/parkings/parking-mellat-exhibition.jpg',
            'الماس شرق': '/images/parkings/parking-almas-shargh.jpg',
            'پروما': '/images/parkings/parking-proma-ferdowsi.jpg',
            'آرمیتاژ': '/images/parkings/parking-armitage-golshan.jpg',
            'آلتون': '/images/parkings/parking-alton-mall.jpg',
            'زیست‌خاور': '/images/parkings/parking-zist-khavar.jpg',
            'فرودگاه': '/images/parkings/parking-hashemi-nejad-airport.jpg',
            'راه‌آهن': '/images/parkings/parking-railway-station.jpg',
            'کوهسنگی': '/images/parkings/parking-koohsangi.jpg',
            'دانشگاه فردوسی': '/images/parkings/parking-ferdowsi-university.jpg',
            'بیمارستان امام رضا': '/images/parkings/parking-imam-reza-hospital.jpg',
            'بیمارستان قائم': '/images/parkings/parking-qaem-hospital.jpg',
            'پایانه': '/images/parkings/parking-imam-reza-terminal.jpg',
        }

        def pick_local_image(name: str) -> str:
            for k, v in LOCAL_IMAGES.items():
                if k in name:
                    return v
            # fallback
            return '/images/parkings/parking-reza-multi-storey.jpg'


        # --- Create a dedicated parking manager for each parking (realistic multi-tenant behavior) ---
        # Each manager will only see and manage their own parking in the Manager Panel (mine=1).
        MANAGER_KEYWORDS = [
            ('دانشگاه فردوسی', 'ferdowsi'),
            ('طبقاتی رضا', 'reza'),
            ('بازار رضا', 'bazar_reza'),
            ('آسمان', 'aseman'),
            ('خسروی', 'khosravi'),
            ('پرستار', 'parastar'),
            ('ورودی شیرازی', 'haram_shirazi'),
            ('نواب صفوی', 'navab_safavi'),
            ('ملت', 'mellat'),
            ('الماس شرق', 'almas_shargh'),
            ('پروما', 'proma'),
            ('آرمیتاژ', 'armitage'),
            ('آلتون', 'alton'),
            ('زیست‌خاور', 'zist_khavar'),
            ('فرودگاه', 'airport'),
            ('راه‌آهن', 'railway'),
            ('کوهسنگی', 'koohsangi'),
            ('بیمارستان امام رضا', 'imam_reza_hospital'),
            ('بیمارستان قائم', 'qaem_hospital'),
            ('پایانه', 'terminal'),
            ('حرم', 'haram'),
        ]

        def manager_slug_from_parking(name: str, i: int) -> str:
            for key, slug in MANAGER_KEYWORDS:
                if key in name:
                    return slug
            return f"parking{i:02d}"

        def get_manager_for_parking(name: str, i: int):
            slug = manager_slug_from_parking(name, i)
            username = f"mgr_{slug}"
            u, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@mashhadparking.ir',
                    'role': User.ROLE_PARKING_MANAGER,
                    'first_name': 'مدیر',
                    'last_name': name[:50],
                },
            )
            u.role = User.ROLE_PARKING_MANAGER
            if not u.check_password('Manager12345!'):
                u.set_password('Manager12345!')
            u.save()
            return u


        created = 0
        for i, item in enumerate(data, start=1):
            owner = get_manager_for_parking(item.get('name',''), i)
            item['image_url'] = pick_local_image(item.get('name',''))
            item['gallery'] = [item['image_url']]
            p, was_created = Parking.objects.get_or_create(
                name=item['name'],
                defaults={
                    'city': item['city'],
                    'address': item['address'],
                    'total_capacity': item['total_capacity'],
                    'price_per_hour': item['price_per_hour'],
                    'latitude': item['latitude'],
                    'longitude': item['longitude'],
                    'image_url': item['image_url'],
                    'gallery': item['gallery'],
                    'amenities': item['amenities'],
                    'description': item['description'],
                    'manager': owner,
                },
            )
            if not was_created:
                p.city = item['city']
                p.address = item['address']
                p.total_capacity = item['total_capacity']
                p.price_per_hour = item['price_per_hour']
                p.latitude = item['latitude']
                p.longitude = item['longitude']
                p.image_url = item['image_url']
                p.gallery = item['gallery']
                p.amenities = item['amenities']
                p.description = item['description']
                p.manager = owner
                p.save()
            created += 1

            if not p.reviews.exists():
                # بین ۳ تا ۷ نظر پیش‌فرض (واقعی‌نما) با نام‌های فارسی
                sample_titles = [
                    'تجربه خوب',
                    'نزدیک و راحت',
                    'امن و مرتب',
                    'کمی شلوغ ولی مناسب',
                    'به‌صرفه',
                    'بهتر از انتظار',
                ]
                sample_comments = [
                    'پارک کردن راحت بود و ورودی/خروجی مشخص داشت.',
                    'به مقصد من نزدیک بود و خیلی سریع جای پارک پیدا کردم.',
                    'روشنایی و امنیت خوب بود؛ حس خوبی داشتم.',
                    'در ساعت شلوغ کمی معطل شدم ولی در کل منظم بود.',
                    'قیمت نسبت به موقعیتش منطقیه و ارزشش رو داره.',
                    'برای دفعه بعد هم همین پارکینگ رو انتخاب می‌کنم.',
                    'اگر با خانواده می‌روید، دسترسی پیاده‌روها خوبه.',
                ]
                admin_replies = [
                    'ممنون از بازخوردتون. خوشحالیم تجربه خوبی داشتید.',
                    'سپاس از شما. پیشنهادتان ثبت شد و برای بهبود پیگیری می‌کنیم.',
                    'ممنون که نظر دادید. در ساعات شلوغ تیم راهنما در محل حاضر است.',
                ]

                count = random.randint(3, 7)
                picked = random.sample(reviewers, k=min(count, len(reviewers)))
                for i, u in enumerate(picked):
                    rating = random.choices([5, 4, 3], weights=[55, 35, 10])[0]
                    title = random.choice(sample_titles)
                    comment = random.choice(sample_comments)
                    created_r = ParkingReview.objects.create(
                        parking=p,
                        user=u,
                        rating=rating,
                        title=title,
                        comment=comment,
                    )

                    # روی حدود ۳۰٪ نظرها پاسخ ادمین بگذاریم
                    if i == 0 and rating <= 4:
                        created_r.admin_reply = random.choice(admin_replies)
                        created_r.replied_at = timezone.now()
                        created_r.save(update_fields=['admin_reply', 'replied_at'])

        self.stdout.write(self.style.SUCCESS(f'Seed complete. Parkings: {created}'))
