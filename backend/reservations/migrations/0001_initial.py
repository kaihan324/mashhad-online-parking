



import django.db.models.deletion

from django.conf import settings

from django.db import migrations, models





class Migration(migrations.Migration):



    initial = True



    dependencies = [

        ('parkings', '0001_initial'),

        migrations.swappable_dependency(settings.AUTH_USER_MODEL),

    ]



    operations = [

        migrations.CreateModel(

            name='Reservation',

            fields=[

                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),

                ('car_plate', models.CharField(max_length=20)),

                ('start_time', models.DateTimeField()),

                ('end_time', models.DateTimeField()),

                ('amount', models.PositiveIntegerField(default=0)),

                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('canceled', 'Canceled'), ('expired', 'Expired')], default='pending', max_length=20)),

                ('created_at', models.DateTimeField(auto_now_add=True)),

                ('parking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to='parkings.parking')),

                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to=settings.AUTH_USER_MODEL)),

            ],

        ),

    ]

