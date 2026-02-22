import django.db.models.deletion

from django.conf import settings

from django.db import migrations, models



class Migration(migrations.Migration):



    initial = True



    dependencies = [

        ('reservations', '0002_add_end_notified_is_paid'),

        migrations.swappable_dependency(settings.AUTH_USER_MODEL),

    ]



    operations = [

        migrations.CreateModel(

            name='PaymentTransaction',

            fields=[

                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),

                ('amount', models.PositiveIntegerField()),

                ('status', models.CharField(choices=[('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed')], default='pending', max_length=20)),

                ('provider', models.CharField(default='mock', max_length=50)),

                ('ref_id', models.CharField(blank=True, max_length=120, null=True)),

                ('created_at', models.DateTimeField(auto_now_add=True)),

                ('paid_at', models.DateTimeField(blank=True, null=True)),

                ('reservation', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='reservations.reservation')),

                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to=settings.AUTH_USER_MODEL)),

            ],

        ),

    ]

