



import django.db.models.deletion

from django.conf import settings

from django.db import migrations, models





class Migration(migrations.Migration):



    initial = True



    dependencies = [

        migrations.swappable_dependency(settings.AUTH_USER_MODEL),

    ]



    operations = [

        migrations.CreateModel(

            name='Parking',

            fields=[

                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),

                ('name', models.CharField(max_length=150)),

                ('city', models.CharField(max_length=80)),

                ('address', models.TextField()),

                ('total_capacity', models.PositiveIntegerField()),

                ('price_per_hour', models.PositiveIntegerField()),

                ('manager', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='managed_parkings', to=settings.AUTH_USER_MODEL)),

            ],

        ),

    ]

